// SKIP THIS ONE?

/** Functions and the 'this' context **/
/* WUT ;P Nog even in duiken ;) */

const thisBinder = {
  parentThis: () => {
    return this;
  },
  myThis: function() {
    return this;
  }
}

const a = () => { return this };
const b = function() { return this; }

console.log(a());
console.log(b());

console.log(thisBinder.parentThis())
console.log(thisBinder.myThis());

// Currying..?
