// Spread

function func(a, b, c, d) {
  console.log(d, c, b, a);
}

let stuff = [1, 2, 3, 4];
func(...stuff);

function func2(...things) {
  console.log(things);
}

func2('string', 6, [1,2,3]);

a = {
  aap: 5,
  noot: 2,
  mies: 8
};

b = { ...a };

b.aap = 10;

console.log(a, b);

// Destructuring

let [a, b] = [4, 5];

let { henk, piet } = { henk: 10, piet: 18 }
