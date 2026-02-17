// Auth Controller

const login = (req, res) => {
  res.json({ message: "Login endpoint" })
}

const register = (req, res) => {
  res.json({ message: "Register endpoint" })
}

export { login, register }