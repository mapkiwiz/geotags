var dispatcher = new Flux.Dispatcher();
var  store = {
  username: undefined,
  password: undefined,
  retype_password: undefined,
  email: undefined
};

dispatcher.register(function(e) {
  switch (e.type) {
    case 'username-update':
      store.username = e.value;
      break;
    case 'password-update':
      store.password = e.value;
      break;
    case 'retype_password-update':
      store.retype_password = e.value;
      break;
    case 'email-update':
      store.email = e.value;
      break;
  }
});

var LabelLink = React.createClass({

  click: function(e) {
    e.preventDefault();
    // perform action
  },

  render: function() {
    return (
      <div className="pull-right" style={{ 'marginTop': '6px' }}>
        <a href="#" onClick={this.click} >{ this.props.text }</a>
      </div>
    );
  }

});

var FormField = React.createClass({

  mixins: [ React.addons.LinkedStateMixin ],

  getInitialState: function() {
    return { value: store[this.props.name], errors: [] };
  },

  componentDidMount: function() {
    var self = this;
    this.dispatchToken = dispatcher.register(function(e) {
      if (e.type == 'errors') {
        var state = self.state;
        state.errors = e.errors[self.props.name] || [];
        self.setState(state);
      }
    });
  },

  componentWillUnmount: function() {
    dispatcher.unregister(this.dispatchToken);
  },

  render: function() {

    var valueLink = this.linkState('value');
    
    var handleChange = function(e) {
      valueLink.requestChange(e.target.value);
      dispatcher.dispatch({
        type: e.target.name + '-update',
        value: e.target.value
      });
    };
    
    var errors = this.state.errors.map(function(error) {
      return (
        <p className="help-block">{ error }</p>
      );
    });

    var className = "form-group";
    if (this.state.errors.length > 0) {
      className += " has-error";
    }

    return (
      <div className={className}>
        <label className="label">
          <span>{ this.props.label }</span>
        </label>
        { this.props.children }
        <input className="form-control input-lg" name={ this.props.name }
          type={ this.props.type }
          placeholder={ this.props.placeholder }
          value={valueLink.value} onChange={handleChange} />
        { errors }
      </div>
    );
  }

});

var SubmitButton = React.createClass({

  render: function() {
      return (
        <div className="button-toolbar pull-right">
          <button className="btn btn-lg btn-primary" type="submit" name={ this.props.name }>
            { this.props.label }
          </button>
        </div>
    );
  }

});

var LoginForm = React.createClass({

  required: [ 'username', 'password' ],

  validate: function() {
    var errors = {}, has_errors = false;
    this.required.forEach(function(field) {
      if (!store[field]) {
        errors[field] = [ "Champ obligatoire" ];
        has_errors = true;
      }
    });
    if (has_errors) {
      dispatcher.dispatch({
        type: 'errors',
        errors: errors
      });
      return false;
    } else {
      return true;
    }
  },

  submit: function(e) {
    e.preventDefault();
    if (this.validate()) {
      this.login();
    }
  },

  login: function() {
    var self = this;
    $.ajax({
      url: this.props.service,
      method: 'POST',
      dataType: 'json',
      data: {
        username: store.username,
        password: store.password
      }
    }).success(function(data) {
      document.location = self.props.next;
    }).error(function(xhr, a, msg) {
      if (xhr.status == 401) {
        dispatcher.dispatch({
          type: 'errors',
          errors: xhr.responseJSON
        });
      } else {
        dispatcher.dispatch({
          type: 'service-error',
          status: xhr.status,
          message: msg,
          data: xhr.responseJSON
        });
      }
    });
  },

  getInitialState: function() {
    return { errors: {} };
  },

  render: function() {
    return (
      <form onSubmit={ this.submit }>
        <h3>{ this.props.title }</h3>
        <input type="hidden" name="next" value="/" />
        <FormField name="username" label="Identifiant" 
          placeholder="Nom d'utilisateur ou email"
          type="text">
          <LabelLink text="Je n'ai pas de compte" />
        </FormField>
        <br/>
        <FormField name="password" label="Mot de passe" type="password">
          <LabelLink text="J'ai oublié mon mot de passe" />
        </FormField>
        <br/>
        <SubmitButton name="login" label="S'identifier" />
      </form>
    );

  }
});

RegisterForm = React.createClass({

  required: [ 'username', 'email', 'password', 'retype_password' ],

  validate: function(e) {
    var errors = {};
    this.required.forEach(function(field) {
      if (!store[field]) {
        errors[field] = [ "Champ obligatoire" ];
      }
    });
    if (store.password != store.retype_password) {
      errors['retype_password'] = [ 'Confirmation non concordante' ];
    }
    if (errors) {
      dispatcher.dispatch({
        type: 'errors',
        errors: errors
      })
      // console.log(store);
      return false;
    } else {
      return true;
    }
  },

  register: function(e) {
    e.preventDefault();
    this.validate();
  },

  render: function() {
    return (
      <form onSubmit={ this.register }>
        <h3>{ this.props.title }</h3>
        <FormField name="username" label="Identifiant"
          placeholder="Nom d'utilisateur"
          type="text">
          <LabelLink text="J'ai déjà un compte" />
        </FormField>
        <FormField name="email" label="Email"
          placeholder="user@example.com"
          type="email" />
        <FormField name="password" label="Mot de passe"
           type="password" />
        <FormField name="retype_password" label="Confirmation du mot de passe"
           type="password" />
        <br/>
        <SubmitButton name="register" label="S'enregistrer" />
      </form>
    );
  }

});

ResetPasswordForm = React.createClass({

  required: [ 'username' ],

  validate: function() {
    var errors = {};
    this.required.forEach(function(field) {
      if (!store[field]) {
        errors[field] = [ "Champ obligatoire" ];
      }
    });
    if (errors) {
      dispatcher.dispatch({
        type: 'errors',
        errors: errors
      })
      // console.log(store);
      return false;
    } else {
      return true;
    }
  },

  resetPassword: function(e) {
    e.preventDefault();
    this.validate();
  },

  render: function() {
    return (
      <form onSubmit={ this.resetPassword } >
        <h3>{ this.props.title }</h3>
        <FormField name="username" label="Identifiant"
          placeholder="Nom d'utilisateur ou email"
          type="text" />
        <br/>
        <SubmitButton name="reset_password" label="Réinitialiser" />
      </form>
    );
  }

});

// window.
var runLoginApp = function(next_url) {

  ReactDOM.render(
      <LoginForm title="Accéder à l'application"
         service="/api/v1/auth/login"
         next={next_url} />,
      document.getElementById('login-form')
  );

  dispatcher.register(function(e) {
    if (e.type == 'service-error') {
      console.log(e);
    }
  });

};

// window.
var autologin = function(token) {

  var next = '/' + token + '/tags';

  $.ajax({
    url: '/api/v1/auth/user', // TODO use config
    method: 'GET',
    dataType: 'json',
  }).success(function(data) {
    console.log("Logged in as " + data.username);
    setTimeout(function() {
      document.location = next;
    }, 1500);
  }).error(function(xhr, a, msg) {
    if (xhr.status == 401) {
      runLoginApp(next);
    }
  });

};

autologin('token');

// module.exports = {
//   runLoginApp: runLoginApp,
//   autologin: autologin
// };

// ReactDOM.render(
//     <RegisterForm title="Créer un nouvel utilisateur" />,
//     document.getElementById('login-form')
// );

// ReactDOM.render(
//     <ResetPasswordForm title="Réinitialiser mon mot de passe" />,
//     document.getElementById('login-form')
// );
