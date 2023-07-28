module.exports = function objectToString(obj) {
  let result = "";
  let messages = [];
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      let value = obj[key];
      result += String(value);
      messages.push(result);
      result = "";
    }
  }
  return messages;
};
