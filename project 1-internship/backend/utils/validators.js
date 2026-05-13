const validateEmail = (email) => {
  const re = /^\S+@\S+\.\S+$/;
  return re.test(email);
};

const validatePassword = (password) => {
  // At least 6 chars, one letter, one number
  return password.length >= 6;
};

const sanitizeUser = (user) => {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    bio: user.bio,
    department: user.department,
    semester: user.semester,
    bookmarks: user.bookmarks,
    createdAt: user.createdAt,
  };
};

module.exports = { validateEmail, validatePassword, sanitizeUser };
