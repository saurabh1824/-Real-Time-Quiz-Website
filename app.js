// array to store the questions its mutiple answers options come from api....
const questionArray = [];

document.addEventListener('DOMContentLoaded', function () {
    // This will run after the DOM is fully loaded
    const containerElements = document.querySelectorAll('.container'); // Targets all elements with class 'question-container'
    const options = document.querySelectorAll('.options');
    const questionboxArray = document.querySelectorAll('.questionbox');

    if (containerElements.length === 0) {
        console.warn("No container elements found with class 'question-container'.");
        return;
    }

    const xhr = new XMLHttpRequest();
    const url = "https://opentdb.com/api.php?amount=10";
    let data;

    xhr.open("GET", url);

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) { // Check for successful response
                try {
                    data = JSON.parse(xhr.responseText);

                    if (data.results.length < containerElements.length) {
                        console.warn("Not enough questions received from API for all containers. Using available questions.");
                    }


                    for (let i = 0; i < data.results.length; i++) {
                        const question = filterUnwantedChars(data.results[i].question);
                        const correctAnswer = data.results[i].correct_answer;
                        let incorrectAnswers = []; // Array to store incorrect answers

                        if (data.results[i].type === "multiple") {
                            incorrectAnswers.push(...data.results[i].incorrect_answers);
                        } else if (data.results[i].type === "boolean") {
                            incorrectAnswers.push(data.results[i].incorrect_answers[0]); // May have only 1 incorrect answer for boolean
                        }

                        // Create a new sub-array for each question and its answers
                        questionArray.push([question, correctAnswer, ...incorrectAnswers]);
                    }

                    console.log(questionArray);

                    // Loop through containers and inject questions (up to the number of questions received)
                    for (let i = 0; i < containerElements.length && i < data.results.length; i++) {
                        const questionbox = questionboxArray[i];
                        if (questionbox) {
                            questionbox.textContent = questionArray[i][0];

                            const option1 = document.createElement('button');
                            const option2 = document.createElement('button');
                            const option3 = document.createElement('button');
                            const option4 = document.createElement('button');

                            styleButton(option1);
                            styleButton(option2);
                            styleButton(option3);
                            styleButton(option4);

                            let randomNumber;
                            if (data.results[i].type === "boolean") {
                                randomNumber = getRandomNumberBetween(1, 2);
                            } else {
                                randomNumber = getRandomNumberBetween(1, 4);
                            }

                            switch (randomNumber) {
                                case 1:
                                    option1.textContent = questionArray[i][1];
                                    option2.textContent = questionArray[i][2];
                                    option3.textContent = questionArray[i][3];
                                    option4.textContent = questionArray[i][4];
                                    break;
                                case 2:
                                    option2.textContent = questionArray[i][1];
                                    option1.textContent = questionArray[i][2];
                                    option3.textContent = questionArray[i][3];
                                    option4.textContent = questionArray[i][4];
                                    break;
                                case 3:
                                    option3.textContent = questionArray[i][1];
                                    option1.textContent = questionArray[i][2];
                                    option2.textContent = questionArray[i][3];
                                    option4.textContent = questionArray[i][4];
                                    break;
                                case 4:
                                    option4.textContent = questionArray[i][1];
                                    option1.textContent = questionArray[i][2];
                                    option2.textContent = questionArray[i][3];
                                    option3.textContent = questionArray[i][4];
                                    break;
                            }

                            option1.addEventListener('click', function () { checkAnswer(i, this); disablebtn(this); });
                            option2.addEventListener('click', function () { checkAnswer(i, this); disablebtn(this); });
                            option3.addEventListener('click', function () { checkAnswer(i, this); disablebtn(this); });
                            option4.addEventListener('click', function () { checkAnswer(i, this); disablebtn(this); });

                            const opt = options[i];
                            opt.appendChild(option1);
                            opt.appendChild(option2);
                            if (data.results[i].type === "multiple") {
                                opt.appendChild(option3);
                                opt.appendChild(option4);
                            }

                        } else {
                            console.warn("Question box element not found. Skipping question.");
                        }
                    }

                } catch (error) {
                    console.error("Error parsing JSON:", error);
                }
            } else {
                console.error("Request failed with status:", xhr.status);
            }
        }
    };
    xhr.send();

    function getRandomNumberBetween(min, max) {
        const randomDecimal = Math.random();
        const randomNumber = Math.floor(randomDecimal * (max - min + 1)) + min;
        return randomNumber;
    }

    function filterUnwantedChars(questionString) {
        const unwantedRegex = /&#039;|&quot;/g;
        const filteredString = questionString.replace(unwantedRegex, "");
        return filteredString;
    }

    function checkAnswer(questionIndex, button) {
        const selectedAnswer = button.textContent || button.innerText;
        const correctAnswer = questionArray[questionIndex][1];
        const category = button.parentElement.id;
        

        if (selectedAnswer === correctAnswer) {
            button.style.backgroundColor = "#38b000";

            let points = parseInt(localStorage.getItem(`${category}-score`)) || 0;
            points += 10;
            localStorage.setItem(`${category}-score`, points);

            let correctAnswers = parseInt(localStorage.getItem(`${category}-correctAnswers`)) || 0;
            correctAnswers += 1;
            localStorage.setItem(`${category}-correctAnswers`, correctAnswers);

            
        } else {
            button.style.backgroundColor = "#FF2400";
        }
        console.log(`Category: ${category}, Score: ${localStorage.getItem(`${category}-score`)}, Correct Answers: ${localStorage.getItem(`${category}-correctAnswers`)}`);
    }

    function disablebtn(parentDiv) {
        const optionsContainer = parentDiv.parentElement;
        const buttons = optionsContainer.querySelectorAll('button');
        for (const button of buttons) {
            button.disabled = true;
        }
    }

    function styleButton(button) {
        button.style.height = "3.5rem";
        button.style.width = "20rem";
        button.style.borderRadius = "0.7rem";
        button.style.borderColor = 'black';
        button.style.borderWidth = '1px';
        button.style.borderStyle = 'solid';
    }

});
