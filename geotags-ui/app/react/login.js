var config = require('./config/login.js');
var DEFAULT_ERROR_MESSAGE = "Oups... une erreur est survenue.";

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
    dispatcher.dispatch({
      type: 'request-route',
      route: this.props.to
    });
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
        <input className="form-control input-lg" name={ this.props.name }
          type={ this.props.type }
          placeholder={ this.props.placeholder }
          value={valueLink.value} onChange={handleChange} />
        { this.props.children }
        { errors }
      </div>
    );
  }

});

var SubmitButton = React.createClass({

  render: function() {
      return (
        <div className="btn-toolbar pull-right">
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
      url: config.services.auth.login,
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
          <LabelLink text="Je n'ai pas de compte" to="register" />
        </FormField>
        <br/>
        <FormField name="password" label="Mot de passe" type="password">
          <LabelLink text="J'ai oublié mon mot de passe" to="reset-password" />
        </FormField>
        <br/>
        <br/>
        <SubmitButton name="login" label="S'identifier" />
      </form>
    );

  }
});

RegisterForm = React.createClass({

  required: [ 'username', 'email', 'password', 'retype_password' ],

  validate: function(e) {
    var errors = {}, has_errors = false;
    this.required.forEach(function(field) {
      if (!store[field]) {
        errors[field] = [ "Champ obligatoire" ];
        has_errors = true;
      }
    });
    if (store.password != store.retype_password) {
      errors['retype_password'] = [ 'Le deux mot de passe ne sont pas identiques' ];
      has_errors = true;
    }
    if (has_errors) {
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

  submit: function(e) {
    e.preventDefault();
    if (this.validate()) {
      this.register();
    }
  },

  register: function() {
    var self = this;
    $.ajax({
      url: config.services.auth.register,
      method: 'POST',
      dataType: 'json',
      data: {
        username: store.username,
        email: store.email,
        password: store.password,
        retype_password: store.retype_password,
        // token: undefined
      }
    }).success(function(data) {
      if (config.autologin) {
        document.location = self.props.next;
      } else {
        dispatcher.dispatch({
          type: 'display-message',
          title: self.props.title,
          message: 'Un e-mail de confirmation vous a été envoyé.',
          status: "success"
        });
      }
    }).error(function(xhr, a, msg) {
      if (xhr.status == 400 || xhr.status == 401 || xhr.status == 403) {
        dispatcher.dispatch({
          type: 'errors',
          errors: xhr.responseJSON
        });
      } else {
        dispatcher.dispatch({
          type: 'display-message',
          title: self.props.title,
          message: DEFAULT_ERROR_MESSAGE,
          status: "warning"
        });
      }
    });
  },

  render: function() {
    return (
      <form onSubmit={ this.submit }>
        <h3>{ this.props.title }</h3>
        <FormField name="username" label="Identifiant"
          placeholder="Nom d'utilisateur"
          type="text">
          <LabelLink text="J'ai déjà un compte" to="login" />
        </FormField>
        <FormField name="email" label="Email"
          placeholder="user@example.com"
          type="email" />
        <FormField name="password" label="Mot de passe"
           type="password" />
        <FormField name="retype_password" label="Confirmation du mot de passe"
           type="password" />
        <br/>
        <br/>
        <SubmitButton name="register" label="S'enregistrer" />
      </form>
    );
  }

});

ForgotPasswordForm = React.createClass({

  required: [ 'email' ],

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
      })
      // console.log(store);
      return false;
    } else {
      return true;
    }
  },

  submit: function(e) {
    e.preventDefault();
    if (this.validate()) {
      this.sendResetPasswordMessage();
    }
  },

  sendResetPasswordMessage: function() {
    var self = this;
    $.ajax({
      url: config.services.auth.forgot_password,
      method: 'POST',
      data: {
        email: store.email
      },
      dataType: 'json'
    }).success(function(data) {
      dispatcher.dispatch({
        type: 'display-message',
        title: self.props.title,
        message: "Un e-mail vous a été envoyé pour réinitialiser votre mot de passe.",
        status: "success"
      });
    }).error(function(xhr, a, msg) {
      if (xhr.status == 404) {
        dispatcher.dispatch({
          type: 'errors',
          errors: xhr.responseJSON
        });
      } else {
        console.log(xhr.status + " -> " + msg);
        dispatcher.dispatch({
          type: 'display-message',
          title: self.props.title,
          message: DEFAULT_ERROR_MESSAGE,
          status: "warning"
        });
      }
    });
  },

  render: function() {
    return (
      <form onSubmit={ this.submit } >
        <h3>{ this.props.title }</h3>
        <FormField name="email" label="Email"
          placeholder="user@example.com"
          type="email">
          <LabelLink text="J'ai retrouvé mon mot de passe" to="login" />
        </FormField>
        <br/>
        <br/>
        <SubmitButton name="reset_password" label="Réinitialiser" />
      </form>
    );
  }

});

var SimpleRouter = React.createClass({

  getInitialState: function() {
    return { route: 'login' };
  },

  componentDidMount: function() {
    var self = this;
    this.dispatchToken = dispatcher.register(function(e) {
      if (e.type == 'request-route') {
        self.setState({ route: e.route });
      } else if (e.type == 'display-message') {
        self.setState({
          route: 'message',
          title: e.title,
          message: e.message,
          status: e.status
        });
      }
    });
  },

  componentWillUnmount: function() {
    dispatcher.unregister(this.dispatchToken);
  },

  render: function() {
    switch (this.state.route) {
      case 'message':
        return (
          <MessageBox title={this.state.title} message={this.state.message} status={this.state.status} />
        );
      case 'register':
        return (
          <RegisterForm title="Créer un nouvel utilisateur" next={this.props.next} />
        );
      case 'reset-password':
        return (
          <ForgotPasswordForm title="Réinitialiser mon mot de passe" />
        );
      case 'login':
      default:
        return (
          <LoginForm title="Accéder à l'application" next={this.props.next} />
        );
    }
  }

});

var Message = React.createClass({

  render: function() {
    return (
      <div className={ "alert alert-" + this.props.status } role="alert">
        { this.props.message }
      </div>
    );
  }

});

var MessageBox = React.createClass({

  click: function(e) {
    e.preventDefault();
    dispatcher.dispatch({
      type: 'request-route',
      route: 'login'
    });
  },

  render: function() {
    return (
      <div>
        <h3>{ this.props.title }</h3>
        <br/>
        <Message message={this.props.message} status={this.props.status} />
        <div className="btn-toolbar pull-right">
          <button className="btn btn-default" onClick={this.click}>Retour</button>
        </div>
      </div>
    );
  }

});

var LoggedInMessage = React.createClass({

  login: function(e) {
    e.preventDefault();
    document.location = this.props.next;
  },

  logout: function(e) {
    e.preventDefault();
    document.location = config.services.auth.logout + '?next=' + document.location.href; 
  },

  render: function() {
    return (
      <div>
        <h3>{ "Accéder à l'application" }</h3>
        <br/>
        <p>{ "Vous êtes connecté en tant que :" }</p>
        <div className="well">
          <span className="glyphicon glyphicon-user"></span>&nbsp;
          <b>{ this.props.username }</b>
        </div>
        <div className="btn-toolbar">
          <button className="btn btn-lg btn-default" onClick={this.logout} >{ "Changer d'utilisateur" }</button>
          <div className="btn-toolbar pull-right">
            <button className="btn btn-lg btn-primary" onClick={this.login} >{ "Ok" }</button>
          </div>
        </div>
      </div>
    );
  }

});

// window.
var runLoginApp = function(next_url) {

  ReactDOM.render(
      <SimpleRouter next={next_url} />,
      document.getElementById('login-form')
  );

  dispatcher.register(function(e) {
    if (e.type == 'service-error') {
      console.log(e);
    }
  });

};

window.autologin = function(token) {

  var next = '/' + token + '/tags';

  $.ajax({
    url: config.services.auth.user,
    method: 'GET',
    dataType: 'json',
  }).success(function(data) {
    ReactDOM.render(
      <LoggedInMessage username={data.username} next={next} />,
      document.getElementById('login-form')
    );
  }).error(function(xhr, a, msg) {
    if (xhr.status == 401) {
      runLoginApp(next);
    } else {
      var title = "Accéder à l'application";
      ReactDOM.render(
        <div>
          <h3>{title}</h3>
          <br/>
          <Message message={DEFAULT_ERROR_MESSAGE} status="warning" />
        </div>,
        document.getElementById('login-form')
      );
    }
  });

};
