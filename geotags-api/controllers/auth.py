# coding: utf-8

from flask import Blueprint, current_app, request, abort, jsonify, redirect, url_for
from flask_login import current_user, login_user, logout_user
from flask_user import signals, emails

auth_api = Blueprint('auth_api', __name__)

@auth_api.route('/login', methods=[ 'POST' ])
def login():

    user_manager = current_app.user_manager
    db_adapter = user_manager.db_adapter
    login_form = user_manager.login_form(request.form)

    # Process valid POST
    if request.method == 'POST' and login_form.validate():
        # Retrieve User
        user = None
        user_email = None
        if user_manager.enable_username:
            # Find user record by username
            user = user_manager.find_user_by_username(login_form.username.data)
            user_email = None
            # Find primary user_email record
            if user and db_adapter.UserEmailClass:
                user_email = db_adapter.find_first_object(db_adapter.UserEmailClass,
                        user_id=int(user.get_id()),
                        is_primary=True,
                        )
            # Find user record by email (with form.username)
            if not user and user_manager.enable_email:
                user, user_email = user_manager.find_user_by_email(login_form.username.data)
        else:
            # Find user by email (with form.email)
            user, user_email = user_manager.find_user_by_email(login_form.email.data)

        if user:

            # Use Flask-Login to sign in user
            #print('login_user: remember_me=', remember_me)
            remember_me = login_form.remember_me.data
            login_user(user, remember=remember_me)
            # Send user_logged_in signal
            signals.user_logged_in.send(current_app._get_current_object(), user=user)
            return jsonify({
                    "user_id": user.id,
                    "username": user.username,
                })

    else:

        errors = { "type": "errors" }
        for field, err in login_form.errors.items():
            errors[field] = [ unicode(e) for e in err ]

        return jsonify(errors), 401

@auth_api.route("/logout", methods=[ 'GET', 'POST'])
def logout():
    """ Sign the user out."""
    user_manager =  current_app.user_manager
    # Send user_logged_out signal
    signals.user_logged_out.send(current_app._get_current_object(), user=current_user)
    # Use Flask-Login to sign out user
    logout_user()
    # Redirect to logout_next endpoint or '/'
    next = request.args.get('next', url_for(user_manager.after_logout_endpoint))  # Get 'next' query param
    return redirect(next)

@auth_api.route('/register', methods=[ 'POST' ])
def register():
    """ Create new User."""

    user_manager =  current_app.user_manager
    db_adapter = user_manager.db_adapter

    # next = request.args.get('next', url_for(user_manager.after_login_endpoint))
    # reg_next = request.args.get('reg_next', url_for(user_manager.after_register_endpoint))

    # Initialize form
    register_form = user_manager.register_form(request.form)    # for register.html
    # invite token used to determine validity of registeree
    invite_token = request.values.get("token")

    # require invite without a token should disallow the user from registering
    if user_manager.require_invitation and not invite_token:
        return jsonify({
                "type": "errors",
                "token": u"Une invitation est obligatoire"
            }), 401

    user_invite = None
    if invite_token and db_adapter.UserInvitationClass:
        user_invite = db_adapter.find_first_object(db_adapter.UserInvitationClass, token=invite_token)
        if user_invite:
            register_form.invite_token.data = invite_token
        else:
            return jsonify({
                "type": "errors",
                "token": u"L'invitation n'est pas valide ou a expiré"
            }), 403

    # Process valid POST
    if request.method=='POST' and register_form.validate():
        # Create a User object using Form fields that have a corresponding User field
        User = db_adapter.UserClass
        user_class_fields = User.__dict__
        user_fields = {}

        # Create a UserEmail object using Form fields that have a corresponding UserEmail field
        if db_adapter.UserEmailClass:
            UserEmail = db_adapter.UserEmailClass
            user_email_class_fields = UserEmail.__dict__
            user_email_fields = {}

        # Create a UserAuth object using Form fields that have a corresponding UserAuth field
        if db_adapter.UserAuthClass:
            UserAuth = db_adapter.UserAuthClass
            user_auth_class_fields = UserAuth.__dict__
            user_auth_fields = {}

        # Enable user account
        if db_adapter.UserProfileClass:
            if hasattr(db_adapter.UserProfileClass, 'active'):
                user_auth_fields['active'] = True
            elif hasattr(db_adapter.UserProfileClass, 'is_enabled'):
                user_auth_fields['is_enabled'] = True
            else:
                user_auth_fields['is_active'] = True
        else:
            if hasattr(db_adapter.UserClass, 'active'):
                user_fields['active'] = True
            elif hasattr(db_adapter.UserClass, 'is_enabled'):
                user_fields['is_enabled'] = True
            else:
                user_fields['is_active'] = True

        # For all form fields
        for field_name, field_value in register_form.data.items():
            # Hash password field
            if field_name=='password':
                hashed_password = user_manager.hash_password(field_value)
                if db_adapter.UserAuthClass:
                    user_auth_fields['password'] = hashed_password
                else:
                    user_fields['password'] = hashed_password
            # Store corresponding Form fields into the User object and/or UserProfile object
            else:
                if field_name in user_class_fields:
                    user_fields[field_name] = field_value
                if db_adapter.UserEmailClass:
                    if field_name in user_email_class_fields:
                        user_email_fields[field_name] = field_value
                if db_adapter.UserAuthClass:
                    if field_name in user_auth_class_fields:
                        user_auth_fields[field_name] = field_value

        # Add User record using named arguments 'user_fields'
        user = db_adapter.add_object(User, **user_fields)
        if db_adapter.UserProfileClass:
            user_profile = user

        # Add UserEmail record using named arguments 'user_email_fields'
        if db_adapter.UserEmailClass:
            user_email = db_adapter.add_object(UserEmail,
                    user=user,
                    is_primary=True,
                    **user_email_fields)
        else:
            user_email = None

        # Add UserAuth record using named arguments 'user_auth_fields'
        if db_adapter.UserAuthClass:
            user_auth = db_adapter.add_object(UserAuth, **user_auth_fields)
            if db_adapter.UserProfileClass:
                user = user_auth
            else:
                user.user_auth = user_auth

        require_email_confirmation = True
        if user_invite:
            if user_invite.email == register_form.email.data:
                require_email_confirmation = False
                db_adapter.update_object(user, confirmed_at=datetime.utcnow())

        db_adapter.commit()

        # Send 'registered' email and delete new User object if send fails
        if user_manager.send_registered_email:
            try:
                # Send 'registered' email
                send_registered_email(user, user_email, require_email_confirmation)
            except Exception as e:
                # delete new User object if send  fails
                db_adapter.delete_object(user)
                db_adapter.commit()
                raise

        # Send user_registered signal
        signals.user_registered.send(current_app._get_current_object(),
                                     user=user,
                                     user_invite=user_invite)

        return jsonify({
                "user_id": user.id,
                "username": user.username,
                "email": user.email,
                "require_confirmation": user_manager.enable_confirm_email and require_email_confirmation
            })

    errors = { "type": "errors" }
    for field, err in register_form.errors.items():
        errors[field] = [ unicode(e) for e in err ]
    return jsonify(errors), 400


@auth_api.route('/forgot_password', methods=[ 'POST' ])
def forgot_password():
    """ Send reset password email."""
    user_manager =  current_app.user_manager
    db_adapter = user_manager.db_adapter
    # Initialize form
    form = user_manager.forgot_password_form(request.form)
    # Process valid POST
    if request.method=='POST' and form.validate():
        email = form.email.data
        user, user_email = user_manager.find_user_by_email(email)

        if user:
            user_manager.send_reset_password_email(email)
            return 200
    else:
        errors = { "type": "errors" }
        for field, err in form.errors.items():
            errors[field] = [ unicode(e) for e in err ]
        return jsonify(errors), 404

@auth_api.route('/user')
def user_info():
    if current_user.is_authenticated:
        return jsonify({
                "user_id": current_user.id,
                "username": current_user.username,
                "email": current_user.email
            })
    else:
        abort(401)

def send_registered_email(user, user_email, require_email_confirmation=True):
    user_manager =  current_app.user_manager
    db_adapter = user_manager.db_adapter

    # Send 'confirm_email' or 'registered' email
    if user_manager.enable_email and user_manager.enable_confirm_email:
        # Generate confirm email link
        object_id = user_email.id if user_email else int(user.get_id())
        token = user_manager.generate_token(object_id)
        confirm_email_link = url_for('user.confirm_email', token=token, _external=True)

        # Send email
        emails.send_registered_email(user, user_email, confirm_email_link)
