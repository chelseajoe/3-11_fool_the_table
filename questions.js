// ─────────────────────────────────────────────────────────────
//  GAME SETTINGS (change these numbers if you like)
// ─────────────────────────────────────────────────────────────
export const SETTINGS = {
  writeSeconds: 60,   // time to write a fake answer
  voteSeconds: 30,    // time to vote
  truthPoints: 1000,  // points for picking the real answer
  foolPoints: 500,    // points for EACH team you fool with your fake
  minOptions: 5       // if there are fewer answers than this, the game adds its own fakes
};

// ─────────────────────────────────────────────────────────────
//  QUESTIONS
//  prompt : the sentence, with ______ where the blank goes
//  answer : the real answer (shown on screen)
//  accept : other spellings that count as the real answer
//           (a team that types one of these is asked to write a fake instead)
//  decoys : the game's own fake answers, used when teams don't write enough
//  fact   : the "Did you know?" card shown after the reveal
//  Add, remove, or edit questions freely.
// ─────────────────────────────────────────────────────────────
export const QUESTIONS = [
  {
    prompt: "The big shopping day after Thanksgiving is called Black ______.",
    answer: "Friday",
    accept: ["friday"],
    decoys: ["Monday", "Thursday", "Deal Day"],
    fact: "One popular explanation: stores finally make a profit that day, going from “in the red” (losing money) to “in the black” (making money)."
  },
  {
    prompt: "Thanksgiving in the USA is always on the fourth ______ of November.",
    answer: "Thursday",
    accept: ["thursday"],
    decoys: ["Friday", "Saturday", "Wednesday"],
    fact: "In 1941, the U.S. Congress made it official: Thanksgiving is the fourth Thursday of November. Many people get Friday off too!"
  },
  {
    prompt: "Canada also celebrates Thanksgiving, but in the month of ______.",
    answer: "October",
    accept: ["october", "oct"],
    decoys: ["September", "November", "August"],
    fact: "Canadian Thanksgiving is on the second Monday of October, about six weeks before the American one."
  },
  {
    prompt: "In 1620, the Pilgrims sailed to America on a ship called the ______.",
    answer: "Mayflower",
    accept: ["mayflower", "may flower"],
    decoys: ["Speedwell", "Endeavour", "Discovery"],
    fact: "About 100 passengers crossed the Atlantic Ocean on the Mayflower. The trip took more than two months!"
  },
  {
    prompt: "In 1621, the Pilgrims shared a harvest feast with the ______ people, who had helped them survive.",
    answer: "Wampanoag",
    accept: ["wampanoag", "wampanoags", "wampanoag tribe"],
    decoys: ["Narragansett", "Lenape", "Mohawk"],
    fact: "About 90 Wampanoag men came to the feast, and it lasted three days. The Wampanoag Nation still lives in Massachusetts today."
  },
  {
    prompt: "President Abraham Lincoln made Thanksgiving a national holiday in the year ______.",
    answer: "1863",
    accept: ["1863"],
    decoys: ["1789", "1621", "1865"],
    fact: "Lincoln announced it in 1863, in the middle of the Civil War, hoping the holiday would help bring the country together."
  },
  {
    prompt: "Sarah Josepha Hale, the woman who convinced Lincoln to create Thanksgiving, also wrote the nursery rhyme “Mary Had a Little ______.”",
    answer: "Lamb",
    accept: ["lamb"],
    decoys: ["Kitten", "Pony", "Garden"],
    fact: "Sarah Josepha Hale wrote letters to presidents for about 17 years asking for a national Thanksgiving. Lincoln finally said yes!"
  },
  {
    prompt: "Benjamin Franklin wrote that the turkey was a more respectable bird than the ______.",
    answer: "Bald Eagle",
    accept: ["bald eagle", "eagle", "eagles", "american eagle"],
    decoys: ["Owl", "Swan", "Rooster"],
    fact: "In a 1784 letter to his daughter, Franklin joked that the bald eagle had “bad moral character.” He never really tried to make the turkey the national bird, though!"
  },
  {
    prompt: "Every year, the U.S. President “pardons” a ______ so it doesn’t get eaten.",
    answer: "Turkey",
    accept: ["turkey", "turkeys"],
    decoys: ["Goose", "Chicken", "Duck"],
    fact: "The official turkey pardon started in 1989. The lucky turkeys get to live the rest of their lives on a farm."
  },
  {
    prompt: "A male turkey is called a ______.",
    answer: "Tom",
    accept: ["tom", "toms", "tom turkey", "gobbler"],
    decoys: ["Drake", "Buck", "Stag"],
    fact: "Male turkeys are called toms (or gobblers), and female turkeys are called hens."
  },
  {
    prompt: "A baby turkey is called a ______.",
    answer: "Poult",
    accept: ["poult", "poults"],
    decoys: ["Gosling", "Chickling", "Gobbling"],
    fact: "Baby turkeys are called poults. They can leave the nest and walk around less than a day after hatching!"
  },
  {
    prompt: "The long, red, floppy skin that hangs over a turkey’s beak is called a ______.",
    answer: "Snood",
    accept: ["snood"],
    decoys: ["Wattle", "Comb", "Crest"],
    fact: "When a male turkey gets excited or wants to show off, his snood gets longer and redder."
  },
  {
    prompt: "Only male turkeys make the famous “______” sound.",
    answer: "Gobble",
    accept: ["gobble", "gobble gobble", "gobbling", "gobbles"],
    decoys: ["Cluck", "Squawk", "Hoot"],
    fact: "Female turkeys don’t gobble. They make clucking and yelping sounds instead."
  },
  {
    prompt: "At night, wild turkeys sleep in ______.",
    answer: "Trees",
    accept: ["trees", "tree", "a tree", "tree branches", "branches"],
    decoys: ["Barns", "Tall Grass", "Nests"],
    fact: "Wild turkeys can fly! They fly up into trees at night to stay safe from animals that hunt them."
  },
  {
    prompt: "The Macy’s Thanksgiving Day Parade in New York City is famous for its giant ______.",
    answer: "Balloons",
    accept: ["balloons", "balloon", "giant balloons", "helium balloons"],
    decoys: ["Puppets", "Kites", "Statues"],
    fact: "The parade started in 1924, and the giant balloons were added in 1927. The biggest balloons need dozens of people holding ropes to guide them down the street!"
  },
  {
    prompt: "On Thanksgiving Day, millions of Americans watch ______ games on TV.",
    answer: "Football",
    accept: ["football", "american football", "nfl", "nfl football", "football games"],
    decoys: ["Soccer", "Hockey", "Tennis"],
    fact: "The Detroit Lions football team has played a game on Thanksgiving almost every year since 1934."
  },
  {
    prompt: "Many Americans eat sweet potatoes with melted ______ on top.",
    answer: "Marshmallows",
    accept: ["marshmallows", "marshmallow", "mini marshmallows"],
    decoys: ["Chocolate", "Peanut Butter", "Cream Cheese"],
    fact: "A marshmallow company shared this recipe more than 100 years ago to help sell more marshmallows. It worked!"
  },
  {
    prompt: "Canned cranberry sauce usually slides out still in the shape of the ______.",
    answer: "Can",
    accept: ["can", "the can", "tin", "cylinder", "tube"],
    decoys: ["Pumpkin", "Bowl", "Moon"],
    fact: "Many Americans love it this way, and some people even slice it along the lines left by the can."
  },
  {
    prompt: "Thousands of Americans run a race on Thanksgiving morning called a “Turkey ______.”",
    answer: "Trot",
    accept: ["trot", "trots"],
    decoys: ["Gallop", "Stomp", "Waddle"],
    fact: "The Turkey Trot in Buffalo, New York, started in 1896, making it one of the oldest footraces in America."
  },
  {
    prompt: "Two people pull a turkey’s wishbone. The person with the bigger piece gets to ______.",
    answer: "Make a wish",
    accept: ["make a wish", "wish", "a wish", "get a wish", "make wish"],
    decoys: ["Keep the bone", "Eat dessert first", "Pick the movie"],
    fact: "Families dry the wishbone for a few days first so it snaps more easily."
  }
];
