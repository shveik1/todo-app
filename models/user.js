class User {
  constructor(firstname, lastname, email, password) {
    this.firstname = firstname;
    this.lastname = lastname;
    this.email = email;
    this.password = password;
  }

  getObject() {
    return {
      firstname: this.firstname,
      lastname: this.lastname,
      email: this.email,
      password: this.password,
    };
  }
}

module.exports = {
  User,
};
