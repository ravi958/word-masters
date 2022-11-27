const letters= document.querySelectorAll(".scoreboard-letter");
const loadingDiv = document.querySelector(".info-bar");
const ANSWER_LENGTH= 5;

async function init(){
  let currentGuess= '';
  let currentRow = 0;
  let isLoading = true;
  let done= false;
  const ROUNDS =6;

  const res= await fetch("https://words.dev-apis.com/word-of-the-day/?")
  const resObj = await res.json();
  const word= resObj.word.toUpperCase();
  const wordParts= word.split("");
  isLoading = false;
  setLoading(isLoading);

  function addLetter(letter){
        // if length is less than answer string, add letters to our string
        if (currentGuess.length < ANSWER_LENGTH){
          currentGuess += letter;
        } else {
          // replace the last letter, if user entering letters even after reaching answer length
          currentGuess = currentGuess.substring(0, currentGuess.length-1)+ letter;
        } 
          // showing letters we captured in browser using innertext
          letters[ANSWER_LENGTH * currentRow + currentGuess.length-1].innerText = letter;
       }
     
  async function commit(){
        if(currentGuess.length !== ANSWER_LENGTH){
          // do nothing
          return;
        } 
      // check the API to see if it's a valid word    
      isLoading = true;
      setLoading(isLoading);
      const res= await fetch("https://words.dev-apis.com/validate-word", {
        method: "POST",
        body: JSON.stringify({word: currentGuess}),
      });
      const { validWord } =  await res.json();
      isLoading= false;
      setLoading(isLoading);

      if(!validWord){
        markInvalidWord();
        return;
      }
        const guessParts= currentGuess.split("");
          const map= makeMap(wordParts);
          for(let i=0; i<ANSWER_LENGTH; i++){
            if(guessParts[i] === wordParts[i]){
              letters[currentRow * ANSWER_LENGTH + i].classList.add("correct");
              map[guessParts[i]]--;
            }
          }
          for(let i=0; i< ANSWER_LENGTH; i++){
            if(guessParts[i] === wordParts[i]){
              // do nothing, we already did it for correct word
            } else if(wordParts.includes(guessParts[i]) && map[guessParts[i]] > 0){
              letters[currentRow * ANSWER_LENGTH + i].classList.add("close");
              map[guessParts[i]]--;
            } else{
              letters[currentRow * ANSWER_LENGTH + i].classList.add("wrong");
            }

          }
        // TODO if they win or lose

        currentRow++;
        if(currentGuess === word){
          alert('you win!!!')
          document.querySelector('.brand').classList.add("winner");
          done =true;
          return;
        } else if(currentRow === ROUNDS){
          alert('you lose, the word was ${word}');
          done = true;
        }
        currentGuess = '';
      }

      function markInvalidWord(){
        for( let i= 0; i< ANSWER_LENGTH; i++){
          letters[currentRow * ANSWER_LENGTH + i].classList.remove("invalid");

       setTimeout(
        () => letters[currentRow * ANSWER_LENGTH + i].classList.add("invalid"), 5);
      }
      }
       function backspace(){
        currentGuess = currentGuess.substring(0, currentGuess.length-1);
        letters[ANSWER_LENGTH * currentRow + currentGuess.length].innerText = '';
       }

     
 document.addEventListener("keydown", function handleKeypress(event){
        const action= event.key;
        if(action === 'Enter'){
          commit();
        } else if(action === 'Backspace'){
          backspace();
        } else if(isLetter(action)){
            addLetter(action.toUpperCase());
        } else{
           // do nothing for any other key presses, ignore
        }
 });

 function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

 function setLoading(isLoading){
  // show spinner if loading, else hide it
  loadingDiv.classList.toggle('show', isLoading);
 }

 function makeMap(array) {
    const obj = {};
    for (let i = 0; i < array.length; i++) {
      if (obj[array[i]]) {
        obj[array[i]]++;
      } else {
        obj[array[i]] = 1;
      }
    }
    return obj;
  }
}
init();
