const normalizePhone = (phone) =>
  phone.startsWith("+91") ? phone : "+91" + phone.replace(/^0+/, "");

const isEmail = (value) => value.includes("@");
module.exports={normalizePhone, isEmail};