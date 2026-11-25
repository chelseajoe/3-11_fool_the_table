// ─────────────────────────────────────────────────────────────
//  GAME SETTINGS (change these numbers if you like)
// ─────────────────────────────────────────────────────────────
export const SETTINGS = {
  writeSeconds: 60,   // time to write a fake answer
  voteSeconds: 30,    // time to vote
  truthPoints: 1000,  // points for picking the real answer
  foolPoints: 500,    // points for EACH team you fool with your fake
  minOptions: 5,      // if there are fewer answers than this, the game adds its own fakes
  shuffle: false      // false = questions play in the order below; true = random order
};

// ─────────────────────────────────────────────────────────────
//  QUESTIONS
//  prompt : the sentence, with ______ where the blank goes
//  answer : the real answer (shown on screen)
//  accept : other spellings that count as the real answer
//           (a team that types one of these is asked to write a fake instead)
//  decoys : the game's own fake answers, used when teams don't write enough
//  fact   : the "Did you know?" card shown after the reveal
//  media  : (optional) pictures or videos shown on the "Did you know?" card.
//           Put the files in the images folder, then list them like this:
//           media: [{ src: "images/photo.jpg" }, { src: "images/clip.mp4", type: "video" }]
//  Add, remove, or edit questions freely.
// ─────────────────────────────────────────────────────────────
export const QUESTIONS = [
  {
    prompt: "Many Americans serve cranberry sauce straight from this kind of container: a ______.",
    answer: "Can",
    accept: ["can", "a can", "the can", "tin", "tin can", "a tin", "cans"],
    decoys: ["Bowl", "Jar", "Box"],
    fact: "Canned cranberry sauce slides out in one piece, still shaped like the can, ridges and all! Many families slice it into circles. Others make it fresh with whole cranberries.",
    media: [
      { src: "images/cranberry-slices.jpg", alt: "Canned cranberry sauce cut into round slices" },
      { src: "images/cranberry-can.mp4", type: "video", alt: "Cranberry sauce sliding out of a can onto a plate" },
      { src: "images/cranberry-plate.jpg", alt: "A Thanksgiving plate with turkey, mashed potatoes, and cranberry sauce" }
    ]
  },
  {
    prompt: "Two people pull a turkey’s wishbone. The person with the bigger piece gets to ______.",
    answer: "Make a wish",
    accept: ["make a wish", "wish", "a wish", "get a wish", "make wish"],
    decoys: ["Keep the bone", "Eat dessert first", "Pick the movie"],
    fact: "Families dry the wishbone for a few days first so it snaps more easily."
  },
  {
    prompt: "Many Americans eat sweet potatoes with melted ______ on top.",
    answer: "Marshmallows",
    accept: ["marshmallows", "marshmallow", "mini marshmallows"],
    decoys: ["Chocolate", "Peanut Butter", "Cream Cheese"],
    fact: "A marshmallow company shared this recipe more than 100 years ago to help sell more marshmallows. It worked!"
  },
  {
    prompt: "The extra food that families eat for days after Thanksgiving is called ______.",
    answer: "Leftovers",
    accept: ["leftovers", "left overs", "leftover", "left over"],
    decoys: ["Seconds", "Extras", "Snacks"],
    fact: "The day after Thanksgiving, many Americans make turkey sandwiches with the leftover turkey, stuffing, and cranberry sauce."
  },
  {
    prompt: "Before eating, many families go around the table and each person says what they are ______ for.",
    answer: "Thankful",
    accept: ["thankful", "grateful", "thanks", "giving thanks", "thank full"],
    decoys: ["Sorry", "Hungry", "Famous"],
    fact: "This tradition is the heart of the holiday. The name Thanksgiving means giving thanks!"
  },
  {
    prompt: "Every year, the U.S. President “pardons” a ______ so it doesn’t get eaten.",
    answer: "Turkey",
    accept: ["turkey", "turkeys"],
    decoys: ["Goose", "Chicken", "Duck"],
    fact: "The official turkey pardon started in 1989. The lucky turkeys get to live the rest of their lives on a farm."
  },
  {
    prompt: "Green bean casserole is a famous Thanksgiving dish topped with crispy fried ______.",
    answer: "Onions",
    accept: ["onions", "onion", "fried onions", "crispy onions", "crispy fried onions"],
    decoys: ["Noodles", "Bacon", "Potatoes"],
    fact: "The recipe was invented in 1955 by a cook named Dorcas Reilly, who worked for a soup company."
  },
  {
    prompt: "The bread mixture that is cooked inside the turkey is called ______.",
    answer: "Stuffing",
    accept: ["stuffing", "dressing", "the stuffing"],
    decoys: ["Filling", "Breading", "Crumble"],
    fact: "In the southern United States, many people call it “dressing” instead, and they often bake it in a separate pan."
  },
  {
    prompt: "On Thanksgiving Day, millions of Americans watch ______ games on TV.",
    answer: "Football",
    accept: ["football", "american football", "nfl", "nfl football", "football games"],
    decoys: ["Soccer", "Hockey", "Tennis"],
    fact: "The Detroit Lions football team has played a game on Thanksgiving almost every year since 1934."
  }
];
