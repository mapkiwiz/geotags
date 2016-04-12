from flask import Blueprint, current_app, request, abort, jsonify, redirect, url_for
from flask_login import current_user, login_user, logout_user
from flask_user import signals

auth_api = Blueprint('auth_api', __name__)

@auth_api.route('/login', methods = [ 'POST' ])
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

@auth_api.route("/logout", methods = [ 'GET', 'POST'])
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

# register
# reset_password
# change_password
# user_info
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
