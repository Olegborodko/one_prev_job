define([], function(){

  let t = new Promise(function(resolve, reject) {
    let a = 'מידע והקצאת פעילויות לכלל הכיתה';
    let b = 'תלמידים שאין מספיק נתונים במערכת כדי לאבחן אותם';
    resolve([a, b]);
  })
  

  return {
    get_strings: () => {
      return t
    }
  }
});