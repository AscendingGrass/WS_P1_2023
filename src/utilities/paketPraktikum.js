const dateIsValidDMY = (date) => {
  date = date.split("/");
  if (date.length != 3) return false;
  if (date[0].length != 2) return false;
  if (date[1].length != 2) return false;
  if (date[2].length != 4) return false;
  date = [date[1], date[0], date[2]].join("/");

  return new Date(date) !== "Invalid Date" && !isNaN(new Date(date));
};

const sequelizeDateOnlyToDMY = (dateOnly) => {
  date = dateOnly.split("-");
  return date[2] + "/" + date[1] + "/" + date[0];
};

const getCurrentDateDMY = () => {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0");
  var yyyy = today.getFullYear();

  today = dd + "/" + mm + "/" + yyyy;
  return today;
};

const getCurrentYear = () => {
  return new Date().getFullYear();
};

const getCurrentMonth = () => {
  return String(new Date().getMonth() + 1).padStart(2, "0");
};

const dmyStringToDate = (dmyString) => {
  let date = dmyString.split("/");
  return new Date([date[2], date[1], date[0]].join("-"));
};

const shuffle = (array) => {
  for (let index = 0; index < array.length; index++) {
    const randomIndex = Math.floor(Math.random() * array.length);
    const temp = array[index];
    array[index] = array[randomIndex];
    array[randomIndex] = temp;
  }
};

const ABCto012 = (char) => {
  switch (char.toUpperCase()) {
    case "A":
      return 0;
    case "B":
      return 1;
    case "C":
      return 2;
    case "D":
      return 3;
    case "E":
      return 4;
    case "F":
      return 5;
    default:
      return -1;
  }
};
const getAPI = () => {
  var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var result = "";
  for (var i = 30; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};

module.exports = {
  dateIsValidDMY,
  sequelizeDateOnlyToDMY,
  getCurrentDateDMY,
  getCurrentYear,
  getCurrentMonth,
  dmyStringToDate,
  shuffle,
  ABCto012,
  getAPI,
};

// async function generateMhsId(){
//     const hasil = await connection.query(
//         "select max(substring(id,4)) as max from mahasiswa",{
//             type : QueryTypes.SELECT
//         }
//     )

//     if(hasil.length == 0) return "MHS001"

//     return "MHS" + (Number(hasil[0].max)+1).toString().padStart(3,'0')
// }
