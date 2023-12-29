
const fromString = (str: string) => str.split("\n").map(line => line.trim()).filter(line => line.length > 0);

export const SETS = [
    {
        name: "Common Secrets",
        items: fromString(`
            Couch
            Coffee table
            Lamp
            Television
            Refrigerator
            Microwave
            Toaster
            Blender
            Dishwasher
            Washing machine
            Dryer
            Vacuum cleaner
            Iron
            Alarm clock
            Toothbrush
            Hairdryer
            Mirror
            Kettle
            Oven
            Knife
            Fork
            Spoon
        `),
    },
    {
        name: "Concepts (Difficulty: Medium)",
        items: fromString(`
            Gardening
            Cooking
            Painting
            Fishing
            Photography
            Dancing
            Camping
            Cycling
            Writing
            Knitting
            Astronomy
            Baking
            Jogging
            Swimming
            Skiing
            Surfing
            Teaching
            Carpentry
            Acting
            Sculpting
            Singing
            Pottery
            Yoga
        `),
    },
    {
        name: "Concepts (Difficulty: Hard)",
        items: fromString(`
            Happiness
            Time
            Friendship
            Love
            Success
            Freedom
            Adventure
            Courage
            Peace
            Knowledge
            Growth
            Creativity
            Tradition
            Change
            Health
            Wisdom
            Power
            Justice
            Nature
            Dreams
            Family
            Honesty
            Wealth
        `),
    },
    {
        name: "Original Marvel",
        items: fromString(`
            Iron Man (2008)
            The Incredible Hulk (2008)
            Iron Man 2 (2010)
            Thor (2011)
            Captain America: The First Avenger (2011)
            The Avengers (2012)
            Iron Man 3 (2013)
            Thor: The Dark World (2013)
            Captain America: The Winter Soldier (2014)
            Guardians of the Galaxy (2014)
            Avengers: Age of Ultron (2015)
            Ant-Man (2015)
            Captain America: Civil War (2016)
            Doctor Strange (2016)
            Guardians of the Galaxy Vol. 2 (2017)
            Spider-Man: Homecoming (2017)
            Thor: Ragnarok (2017)
            Black Panther (2018)
            Avengers: Infinity War (2018)
            Ant-Man and The Wasp (2018)
        `),
    },
];
