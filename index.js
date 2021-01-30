const fs = require('fs').promises;
const path = require('path');

const dataFilePath = path.join(__dirname, 'data/data.bin');

async function loadBinaryList(filepath) {
  const data = await fs.readFile(filepath);

  const returnArray = [];

  let counter = 0;
  let tempString = '';
  for (d of data) {
    if (counter === 0) {
      if(tempString !== '') {
        returnArray.push(tempString);
      }

      counter = d;
      tempString = '';
    } else {
      tempString += String.fromCharCode(d);
      counter--;
    }
  }

  // Add the last value
  if(tempString !== '') {
    returnArray.push(tempString);
  }

  return returnArray;
}

function getMatchingLength(searchText, searchPosition, word, wordPosition) {
  let matchLength = 0;
  while (searchText[searchPosition] === word[wordPosition] && searchText[searchPosition] !== undefined) {
    matchLength++;
    searchPosition++;
    wordPosition++;
  }

  return matchLength;
}

// Simple fuzzy search
// Gives each word a score proportional to the number of consecutive matching characters
function fuzzySearch(list, searchTerm) {
  let bestScore = 0;
  let returnWord = '';

  // Go through list
  for (let item of list) {
    let currentScore = 0;
    let notFirstCharFlag = true;

    // character by character matching
    for (let searchPosition = 0; searchPosition < searchTerm.length; searchPosition++) {
      let pos = item.indexOf(searchTerm[searchPosition]);
      if (pos === -1) { continue; }

      // take points off if the first match is not the first character in the word
      // This is if two words get matching scores, the word that starts closest to the search string gets a bonus
      // This is because users typically search for words  from the beginning and not the middle
      if (notFirstCharFlag === true ) {currentScore = currentScore - pos}
      notFirstCharFlag = false;
      
      // Find length of consecutive matching characters
      let matchLength = getMatchingLength(searchTerm, searchPosition, item, pos);
      currentScore += matchLength;
    }

    // Check score
    if (currentScore > bestScore) {
      bestScore = currentScore;
      returnWord = item;
    }
  }

  return returnWord;
}

(async () => {
  try {
    if (!process.argv[2]) { throw 'No Search String Given'; }

    const fileContents = await loadBinaryList(dataFilePath);
    const bestMatch = fuzzySearch(fileContents, process.argv[2]);
  
    console.log();
    console.log('BEST MATCH:');
    console.log(bestMatch);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
})();
