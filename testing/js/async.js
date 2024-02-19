function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  async function eatLunch(animal, time) {
    console.log(`${animal} aloittaa syömisen...`);
    await sleep(time);
    console.log(`${animal} on syönyt lounaan!`);
  }
  
  async function main() {
    eatLunch('Krokotiili', 2000); // Krokotiili syö 2 sekuntia
    eatLunch('Alligaattori', 1000); // Alligaattori syö 1 sekunnin
    await sleep(3000);
    console.log("Eläimet menevät nukkumaan!");
    await sleep (6000);
    console.log("Eläimet heräsivät!");
    await sleep (1000);
    await eatLunch('Krokotiili', 2000); // Krokotiili syö 2 sekuntia
    await eatLunch('Alligaattori', 1000); // Alligaattori syö 1 sekunnin
  }
  
  main();
  