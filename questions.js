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
    fact: "The wishbone is actually the bird’s collarbone! Families let it dry for a few days so it snaps more easily. Then two people pull, and whoever gets the bigger piece makes a wish.",
    media: [
      { src: "images/wishbone-pull.jpg", alt: "Two people pulling a turkey wishbone over a Thanksgiving turkey" },
      { src: "images/wishbone.gif", alt: "Animated wishbone being pulled apart" },
      { src: "images/wishbone-bone.jpg", alt: "A dried wishbone next to a bird skeleton showing where the wishbone is" }
    ]
  },
  {
    prompt: "Many Americans eat sweet potatoes with melted ______ on top.",
    answer: "Marshmallows",
    accept: ["marshmallows", "marshmallow", "mini marshmallows"],
    decoys: ["Chocolate", "Peanut Butter", "Cream Cheese"],
    fact: "This dish is often called “candied yams.” In the U.S., orange sweet potatoes are often called yams, even though real yams are a different plant! A marshmallow company shared the recipe more than 100 years ago to help sell more marshmallows.",
    media: [
      { src: "images/marshmallow-casserole.jpg", alt: "Sweet potato casserole topped with toasted marshmallows" },
      { src: "images/marshmallows.jpg", alt: "A pile of white marshmallows" },
      { src: "images/sweet-potatoes.jpg", alt: "Whole and cut orange sweet potatoes" }
    ]
  },
  {
    prompt: "The bread mixture that is cooked inside the turkey is called ______.",
    answer: "Stuffing",
    accept: ["stuffing", "dressing", "the stuffing"],
    decoys: ["Filling", "Breading", "Crumble"],
    fact: "Stuffing is made from bread, onion, celery, herbs, butter, and broth. In the southern United States, many people call it “dressing” instead, and they often bake it in a separate pan.",
    media: [
      { src: "images/stuffing-ingredients.jpg", alt: "Stuffing ingredients: bread, onion, celery, herbs, butter, broth" },
      { src: "images/stuffing-dish.jpg", alt: "A baking dish of golden stuffing" },
      { src: "images/stuffing-plate.jpg", alt: "A Thanksgiving plate with turkey, stuffing, mashed potatoes, green beans, and cranberry sauce" }
    ]
  },
  {
    prompt: "The extra food that families eat for days after Thanksgiving is called ______.",
    answer: "Leftovers",
    accept: ["leftovers", "left overs", "leftover", "left over"],
    decoys: ["Seconds", "Extras", "Snacks"],
    fact: "The day after Thanksgiving, many Americans make turkey sandwiches with the leftover turkey, stuffing, and cranberry sauce.",
    media: [
      { src: "images/leftovers-containers.jpg", alt: "Thanksgiving leftovers in glass containers" },
      { src: "images/leftovers-sandwich-1.jpg", alt: "A tall leftover Thanksgiving sandwich" },
      { src: "images/leftovers-sandwich-2.jpg", alt: "A turkey, stuffing, and cranberry sandwich" }
    ]
  },
  {
    prompt: "Before eating, many families go around the table and each person says what they are ______ for.",
    answer: "Thankful",
    accept: ["thankful", "grateful", "thanks", "giving thanks", "thank full"],
    decoys: ["Sorry", "Hungry", "Famous"],
    fact: "This tradition is the heart of the holiday. The name Thanksgiving means giving thanks! Many families also hold hands or bow their heads to say a short thank-you before eating.",
    media: [
      { src: "images/thankful-family-1.jpg", alt: "A family giving thanks before a meal" },
      { src: "images/thankful-family-2.jpg", alt: "A family holding hands around the Thanksgiving table" },
      { src: "images/thankful-art.jpg", alt: "A cartoon family of mice at a Thanksgiving table" }
    ]
  },
  {
    prompt: "Every year, the U.S. President “pardons” a ______ so it doesn’t get eaten.",
    answer: "Turkey",
    accept: ["turkey", "turkeys"],
    decoys: ["Goose", "Chicken", "Duck"],
    fact: "The official turkey pardon started in 1989. Each year at the White House, the President pardons a turkey, and the lucky turkeys get to live the rest of their lives on a farm.",
    media: [
      { src: "images/pardon-1.jpg", alt: "A President pardoning a white turkey at the White House" },
      { src: "images/pardon-2.jpg", alt: "A President pardoning a turkey in front of fall leaves" },
      { src: "images/pardon-3.jpg", alt: "A President pardoning a turkey at the White House" }
    ]
  },
  {
    prompt: "On Thanksgiving Day, millions of Americans watch ______ games on TV.",
    answer: "Football",
    accept: ["football", "american football", "nfl", "nfl football", "football games"],
    decoys: ["Soccer", "Hockey", "Tennis"],
    fact: "The Detroit Lions football team has played a game on Thanksgiving almost every year since 1934. After some games, the winning players even eat turkey legs on the field!",
    media: [
      { src: "images/football-1.jpg", alt: "Football players eating turkey on the field after a Thanksgiving game" },
      { src: "images/football-2.jpg", alt: "Football players celebrating with a turkey after a Thanksgiving game" },
      { src: "images/football-schedule.jpg", alt: "A schedule of Thanksgiving week football games" }
    ]
  }
];
