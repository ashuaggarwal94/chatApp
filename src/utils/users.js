const users = [];

//add user
const addUser = ({ id, username, room }) => {
  //Clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //Validate the data
  if (!username || !room) {
    return { error: "Username and room are required" };
  }
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });
  if (existingUser) {
    return { error: "Username is already in room" };
  }

  //Store User
  const user = { id, username, room };
  users.push(user);
  return { user };
};

//remove user
const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== 1) return users.splice(index, 1)[0];
};
//get user
const getUser = (id) => {
  let foundUser = users[users.findIndex((user) => user.id === id)];
  return foundUser;
};

//getUsersinRoom
const getUsersinRoom = (room) => {
  return users.filter((user) => user.room === room);
};

module.exports = { addUser, removeUser, getUser, getUsersinRoom };
