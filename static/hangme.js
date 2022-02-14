function App(props){

    return(
        <div style={{marginTop:'50px'}}>
            <div style={{display:'inline-block',verticalAlign:'middle'}}><Hangman /></div>
            <div style={{display:'inline-block',verticalAlign:'middle',margin:'auto',width:'45%'}}><FillInWord /></div>
        </div>
    );

}

function Hangman(props){

    //draws initial hangman state
    function hangmanOnLoad(){
        var canvas = document.getElementById("hangman");
        var ctx = canvas.getContext('2d');

        ctx.lineWidth = 10;
        ctx.fillStyle='#000000';
        ctx.beginPath();

        //draw base
        ctx.moveTo(100,400);
        ctx.lineTo(400,400);
        ctx.stroke();

        //draw vertical pole
        ctx.moveTo(150, 100);
        ctx.lineTo(150, 400);
        ctx.stroke();

        //draw top
        ctx.moveTo(150, 100);
        ctx.lineTo(300, 100);
        ctx.stroke();

        //draw noose
        ctx.moveTo(300, 100);
        ctx.lineTo(300, 150);
        ctx.stroke();
    
    }

    $( document ).ready(function() {
        hangmanOnLoad();
    });

    return(
        <div>
            <canvas id='hangman' width='500' height='500' >Your browser doesn't support canvas.</canvas>
        </div>
    )
}

function FillInWord(props){

    const [word, setWord] = React.useState('');
    const [wordDisplay, setWordDisplay] = React.useState('');
    const [currentLetter, setCurrentLetter] = React.useState('');
    const [lettersGuessed, setLettersGuessed] = React.useState([]);
    const [errorCount, setErrorCount] = React.useState(1);
    const [score, setScore] = React.useState([localStorage.getItem('wins'),localStorage.getItem('losses')]);

    //if new session, set score from [null,null] to [0,0]
    if(score[0]==null | score[1]==null){
        if(score[0]==null){
            setScore(['0',score[1]])
        }
        if(score[1]==null){
            setScore([score[0],'0'])
        }
    }

    //get word from backend
    function getWord(){

        //AJAX call to backend to get word to be used
        $.ajax({
            url: '/getWord',
            data: '',
            type: 'GET',
            
            success: function(data){
                setWord(data.WORD);
                var space='_';
                setWordDisplay(space.repeat(data.WORD.length));
                console.log(data.WORD);
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                console.log("Error getting word");
            }

        });
    }      

    //only getWord if current state is empty 
    if(word==''){
        getWord();
    }

    //define alphabet list for validating input
    var alphabet='abcdefghijklmnopqrstuvwxyz'.split('');

    //checks if user has won (i.e. when word and wordDisplay are equal) and resets screen and relevant vars. 
    React.useEffect(()=>{

        if(word==wordDisplay && word!= '' && wordDisplay!=''){

            //init canvas draw functions
            var canvas = document.getElementById("hangman");
            var ctx = canvas.getContext('2d');

            //game over - get new Word, clear hangman off canvas, reset errorCount & lettersGuessed
            getWord();
            ctx.clearRect(245, 145, 110, 190); //format: x start, y start, rect width, rect height
            setErrorCount(1);
            setLettersGuessed([]);
            localStorage.setItem('wins',parseInt(score[0])+1) //update localStorage
            setScore([parseInt(score[0])+1,score[1]]); //update score (add 1 win)
            setCurrentLetter('');

        }

    },[wordDisplay]);            //function only runs when wordDisplay state is updated.


  
    //have to useEffect so that I can setup and remove each keypress listener on each render (so that they don't multiply)
    React.useEffect(() => {
        
        //listen for key presses
        $('html').keypress(function(e) {

            //checks if splash screen has been clicked through
            if(localStorage.getItem('ready', true)){

            //if input is a valid letter, setCurrentLetter to it
            if(alphabet.includes(String.fromCharCode(e.keyCode))){
                setCurrentLetter(String.fromCharCode(e.keyCode));
            }

            //if user presses enter, run main function (check if letter is in word etc)
            else if(e.keyCode==13){
                
                //check if currentLetter is in Word
                //if currentLetter is in Word and not null, update displayWord
                if(word.includes(currentLetter)==true && currentLetter != ''){

                    //generate list of indices where letter occurs in Word
                    var letterIndices = [];
                    for(var i=0; i<word.length;i++){
                        if(word[i]===currentLetter){
                            letterIndices.push(i);
                        }
                    }

                    //use indices of currentLetter in Word to add correctly guessed letters to displayWord
                    var tempWD = wordDisplay;
                    for(var j=0; j<letterIndices.length; j++){
                        tempWD=tempWD.substring(0, letterIndices[j]) + currentLetter + tempWD.substring(letterIndices[j] + 1);
                    }

                    setWordDisplay(tempWD);

                }
                //if currentLetter isn't in Word and hasn't already been guessed, draw next part of Hangman
                else if(word.includes(currentLetter)==false && lettersGuessed.includes(currentLetter + ' ')==false){

                    //add letter guessed to lettersGuessed array
                    var lettersGuessedCopy = [...lettersGuessed];
                    lettersGuessedCopy.push(currentLetter + ' ');
                    setLettersGuessed(lettersGuessedCopy);

                    //increment errorCount to draw next body part in sequence
                    setErrorCount(errorCount+1)

                    //init canvas draw functions
                    var canvas = document.getElementById("hangman");
                    var ctx = canvas.getContext('2d');
                    ctx.lineWidth = 10;

                    //draw body parts
                    if(errorCount==1){                          //head
                        ctx.beginPath();
                        ctx.arc(300, 170, 20, 0, 2 * Math.PI);
                        ctx.stroke();
                    }
                    else if(errorCount==2){                     //body
                        ctx.beginPath();
                        ctx.moveTo(300,190);
                        ctx.lineTo(300,300);
                        ctx.stroke();
                    }
                    else if(errorCount==3){                     //left arm
                        ctx.beginPath();
                        ctx.moveTo(300,220);
                        ctx.lineTo(250,250);
                        ctx.stroke();
                    }
                    else if(errorCount==4){                     //right arm
                        ctx.beginPath();
                        ctx.moveTo(300,220);
                        ctx.lineTo(350,250);
                        ctx.stroke();
                    }
                    else if(errorCount==5){                     //left leg
                        ctx.beginPath();
                        ctx.moveTo(300,300);
                        ctx.lineTo(250,330);
                        ctx.stroke();
                    }
                    else if(errorCount==6){                     //right leg
                        ctx.beginPath();
                        ctx.moveTo(300,300);
                        ctx.lineTo(350,330);
                        ctx.stroke();

                        //game over - get new Word, clear hangman off canvas, reset states and alert correct answer, etc.
                        getWord();
                        ctx.clearRect(245, 145, 110, 190); //format: x start, y start, rect width, rect height
                        setErrorCount(1);
                        setLettersGuessed([]);
                        localStorage.setItem('losses',parseInt(score[1])+1) //update localStorage
                        setScore([score[0],parseInt(score[1])+1]); //update score (add 1 loss)
                        setCurrentLetter('');
                        alertify.alert('YOU LOSE', 'The correct word was ' + word).setting({transition:'fade'});

                    }
                    
                }
            }
            }

        });
        

    return () => { $('html').unbind() } //unbind keypress listener after each use so that you're not spawning a million listeners

    });


    return(

        <div style={{textAlign:'center'}}>
            <h1 style={{letterSpacing:'15px'}}>{wordDisplay}</h1>
            <h1>{currentLetter}<span className='nonBreakingSpaceToHoldLineOpen'>&nbsp;</span></h1>
            <h3>Letters guessed: <br />{lettersGuessed}<span className='nonBreakingSpaceToHoldLineOpen'>&nbsp;</span></h3>
            <h3>Wins: {score[0]} Losses: {score[1]}</h3>
        </div>

    )
}


ReactDOM.render(<App />, document.getElementById('app'));