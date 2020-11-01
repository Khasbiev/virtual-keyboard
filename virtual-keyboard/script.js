const textArea = document.querySelector(".use-keyboard-input");
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const record = new SpeechRecognition();
record.interimResults = false;
record.maxAlternatives = 1;

const Keyboard = {
    elements: {
        main: null,
        keysContainer: null,
        keys: []
    },
    
    selection: {
        center: 0
    },

    deleted: {
        moreThanOne: false
    },

    eventHandlers: {
        oninput: null,
        onclose: null
    },
    
    cursor: {
        position: 0
    },

    properties: {
        value: "",
        capsLock: false,
        shift: false,
        voice: false,
        sounds: true,
        lang: "en"
    },

    keyboardKeyCodes: {
        keyCodes: [
            192, 49, 50, 51, 52, 53, 54, 55, 56, 57, 48, 189, 187,
            81, 87, 69, 82, 84, 89, 85, 73, 79, 80, 219, 221,
            65, 83, 68, 70, 71, 72, 74, 75, 76, 186, 222, 220, 
            90, 88, 67, 86, 66, 78, 77, 188, 190, 191
        ]
    },

    keyLayoutLanguage: {
        en: [
            "`","1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "backspace",
            "q", "w", "e", "r", "t", "y", "u", "i", "o", "p","[","]",
            "caps", "a", "s", "d", "f", "g", "h", "j", "k", "l",";","'","\\", "enter",
            "shift", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/",
            "hide","language","space","left","right","voice","sounds"
        ],
        ru: [
            "ё","1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "backspace",
            "й", "ц", "у", "к", "е", "н", "г", "ш", "щ", "з","х","ъ",
            "caps", "ф", "ы", "в", "а", "п", "р", "о", "л", "д","ж","э","\\", "enter",
            "shift", "я", "ч", "с", "м", "и", "т", "ь", "б", "ю", ".",
            "hide","language","space","left","right","voice","sounds"
        ]
    },

    shiftLayout: {
        keys_en: ["~","!","@","#","$","%","^","&","*","(",")","_","+"],
        keys_ru: ["Ё",'!','"','№',';','%',':','?','*','(',')',"_","+"],
        keys_symbols_en_on: ["{","}",":",'"',"|","<",">","?"],
        keys_symbols_en_off: ["[","]",";","'","\\",',','.','/'],
        keys_symbols_ru_on: ["Х","Ъ","Ж",'Э',"/","Б","Ю",","],
        keys_symbols_ru_off: ["х","ъ","ж","э","\\",'б','ю','.']
    },

    init() {
        this.elements.main = document.createElement("div");
        this.elements.keysContainer = document.createElement("div");
        this.elements.main.classList.add("keyboard", "keyboard--hidden");
        this.elements.keysContainer.classList.add("keyboard__keys");
        this.elements.keysContainer.appendChild(this._createKeys());
        this.elements.keys = this.elements.keysContainer.querySelectorAll(".keyboard__key");
        this.elements.main.appendChild(this.elements.keysContainer);
        document.body.appendChild(this.elements.main);
        document.querySelectorAll(".use-keyboard-input").forEach(element => {
            element.addEventListener("focus", () => {
                this.open(element.value, currentValue => {
                    element.value = currentValue;
                });
            });
        });

        window.addEventListener("keydown", (event) => {
            if (document.querySelector(`#k_${event.keyCode}`))
            {
                event.preventDefault();
                this.cursor.position = textArea.selectionStart;
                if (textArea.selectionStart === textArea.selectionEnd)
                {
                    this.properties.value = this.properties.value.substr(0, this.cursor.position) + (document.querySelector(`#k_${event.keyCode}`).textContent) + this.properties.value.substr(this.cursor.position, );
                }
                else
                {
                    this.properties.value = this.properties.value.substring(0, textArea.selectionStart) + (document.querySelector(`#k_${event.keyCode}`).textContent) + this.properties.value.substring(textArea.selectionEnd, );
                }
                textArea.value = this.properties.value;
                textArea.selectionStart = this.cursor.position + 1;
                textArea.selectionEnd = this.cursor.position + 1;
                document.querySelector(`#k_${event.keyCode}`).style.background = "grey";
                setTimeout(function() { document.querySelector(`#k_${event.keyCode}`).style.background = "" }, 200);
                if (this.properties.sounds && this.properties.lang === "en")
                {
                    const audio = document.querySelector('audio[data-key="all_en"]');
                    audio.currentTime = 0;
                    audio.play();
                }
                else if (this.properties.sounds && this.properties.lang === "ru") 
                {
                    const audio = document.querySelector('audio[data-key="all_ru"]');
                    audio.currentTime = 0;
                    audio.play();
                }
            }
        })

        textArea.addEventListener("blur", function () {
            if (!(Keyboard.elements.main.classList.contains("keyboard--hidden")))
            {
                this.focus();
            }
        });

        record.addEventListener("result", (event) => {
            let resultText = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join("");
            if (event.results[0].isFinal) 
            {
                this.cursor.position = textArea.selectionStart;
                this.properties.value = this.properties.value.substr(0, this.cursor.position) + resultText + this.properties.value.substr(this.cursor.position, );
                textArea.value = this.properties.value;
                textArea.selectionStart = this.cursor.position + resultText.length;
                textArea.selectionEnd = this.cursor.position + resultText.length;
            }
        });

        record.addEventListener("end", () => {
            if (this.properties.voice)
            {
                record.start();
            }
        });
    },

    _createKeys() {
        const fragment = document.createDocumentFragment();
        
        const keyLayout = this.keyLayoutLanguage.en;

        const createIconHTML = (icon_name) => {
            return `<i class="material-icons">${icon_name}</i>` 
        };

        let counter = 0;

        keyLayout.forEach(key => {
            const keyElement = document.createElement("button");
            const insertLineBrake = ["backspace", "]", "enter", "/"].indexOf(key) !== -1;

            keyElement.setAttribute("type", "button");
            keyElement.classList.add("keyboard__key");

            switch (key) {
                case "sounds":
                    keyElement.classList.add("keyboard__key", "keyboard__key--activatable", "keyboard__key--active");
                    keyElement.innerHTML = createIconHTML("volume_up");

                    keyElement.addEventListener("click", () => {
                        this._toggleSounds();
                        keyElement.innerHTML = this.properties.sounds ? '<i class="material-icons">volume_up</i>' : '<i class="material-icons">volume_off</i>';
                        keyElement.classList.toggle("keyboard__key--active", this.properties.sounds);
                        if (this.properties.sounds)
                        {
                            const audio = document.querySelector('audio[data-key="switcher_on"]');
                            audio.currentTime = 0;
                            audio.play();
                        }
                        else
                        {
                            const audio = document.querySelector('audio[data-key="switcher_off"]');
                            audio.currentTime = 0;
                            audio.play();
                        }
                    });

                    break;

                case "voice":
                    keyElement.classList.add("keyboard__key", "keyboard__key--activatable");
                    keyElement.innerHTML = createIconHTML("mic");

                    keyElement.addEventListener("click", () => {
                        this._toggleVoiceWrite();
                        this._triggerEvent("oninput");
                        keyElement.classList.toggle("keyboard__key--active", this.properties.voice);
                        if (this.properties.sounds)
                        {
                            if (this.properties.voice)
                            {
                                const audio = document.querySelector('audio[data-key="switcher_on"]');
                                audio.currentTime = 0;
                                audio.play();
                            }
                            else
                            {
                                const audio = document.querySelector('audio[data-key="switcher_off"]');
                                audio.currentTime = 0;
                                audio.play();
                            }
                        }
                    });

                    break;
                
                case "right":
                    keyElement.classList.add("keyboard__key");
                    keyElement.innerHTML = createIconHTML("keyboard_arrow_right");

                    window.addEventListener("keydown", (event) => {
                        if (event.keyCode === 39)
                        {
                            keyElement.style.background = "grey";
                            setTimeout(function() { keyElement.style.background = "" }, 200);
                            if (this.properties.sounds)
                            {
                                const audio = document.querySelector(`audio[data-key="all_${this.properties.lang}"]`);
                                audio.currentTime = 0;
                                audio.play();
                            }
                        }
                    });

                    keyElement.addEventListener("click", () => {
                        this.cursor.position = textArea.selectionStart;
                        if (this.properties.shift && (this.selection.center === 0 || (textArea.selectionStart === textArea.selectionEnd)))
                        {
                            this.selection.center = textArea.selectionStart;
                        }
                        if (!this.properties.shift)
                        {
                            textArea.selectionStart = this.cursor.position + 1;
                            textArea.selectionEnd = this.cursor.position + 1;
                        }
                        else if (this.properties.shift && textArea.selectionStart < this.selection.center)
                        {
                            textArea.selectionStart += 1;
                        }
                        else if (this.properties.shift && textArea.selectionEnd > this.selection.center)
                        {
                            if (textArea.selectionEnd !== textArea.value.length)
                            {
                                textArea.selectionEnd += 1;
                            }
                        }
                        else if (this.properties.shift && (textArea.selectionEnd === textArea.selectionStart))
                        {
                            textArea.selectionEnd += 1;
                        }
                        if (this.properties.sounds)
                        {
                            const audio = document.querySelector(`audio[data-key="all_${this.properties.lang}"]`);
                            audio.currentTime = 0;
                            audio.play();
                        }
                    });

                    break;

                case "left":
                    keyElement.classList.add("keyboard__key");
                    keyElement.innerHTML = createIconHTML("keyboard_arrow_left");

                    window.addEventListener("keydown", (event) => {
                        if (event.keyCode === 37)
                        {
                            keyElement.style.background = "grey";
                            setTimeout(function() { keyElement.style.background = "" }, 200);
                            if (this.properties.sounds)
                            {
                                const audio = document.querySelector(`audio[data-key="all_${this.properties.lang}"]`);
                                audio.currentTime = 0;
                                audio.play();
                            }
                        }
                    });

                    keyElement.addEventListener("click", () => {
                        this.cursor.position = textArea.selectionStart;
                        if (this.properties.shift && (this.selection.center === 0 || (textArea.selectionStart === textArea.selectionEnd)))
                        {
                            this.selection.center = textArea.selectionEnd;
                        }
                        if (!this.properties.shift)
                        {
                            textArea.selectionStart = this.cursor.position - 1;
                            textArea.selectionEnd = this.cursor.position - 1;
                        }
                        else if (this.properties.shift && textArea.selectionEnd > this.selection.center)
                        {
                            textArea.selectionEnd -= 1;
                        }
                        else if (this.properties.shift && textArea.selectionStart < this.selection.center)
                        {
                            if (textArea.selectionStart !== 0)
                            {
                                textArea.selectionStart -= 1;
                            }
                        }
                        else if (this.properties.shift && (textArea.selectionStart === textArea.selectionEnd))
                        {
                            textArea.selectionStart -= 1;
                        }
                        if (this.properties.sounds)
                        {
                            const audio = document.querySelector(`audio[data-key="all_${this.properties.lang}"]`);
                            audio.currentTime = 0;
                            audio.play();
                        }
                    });

                    break;
                
                case "language":
                    keyElement.classList.add("keyboard__key--wide");
                    keyElement.innerHTML = createIconHTML("language");

                    keyElement.addEventListener("click", () => {
                        if (this.properties.shift)
                        {
                            this._toggleShift();
                            this.elements.keys[40].style.background = "";
                            this.elements.keys[40].classList.toggle("keyboard__key--active", this.properties.shift);
                        }
                        if (this.properties.capsLock)
                        {
                            this._toggleCapsLock();
                            this.elements.keys[26].style.background = "";
                            this.elements.keys[26].classList.toggle("keyboard__key--active", this.properties.capsLock);
                        }
                        if (this.properties.sounds)
                        {
                            const audio = document.querySelector('audio[data-key="switcher_on"]');
                            audio.currentTime = 0;
                            audio.play();
                        }
                        this._toggleLanguage();
                    });

                    break;

                case "shift":
                    keyElement.classList.add("keyboard__key--wide", "keyboard__key--activatable");
                    keyElement.innerHTML = createIconHTML("upgrade");

                    window.addEventListener("keydown", (event) => {
                        if (event.keyCode === 16)
                        {
                            if (!this.properties.shift) { 
                                this._toggleShift(); 
                                keyElement.style.background = "grey"; 
                                keyElement.classList.toggle("keyboard__key--active", this.properties.shift); 
                                if (this.properties.sounds)
                                {
                                    const audio = document.querySelector('audio[data-key="shift"]');
                                    audio.currentTime = 0;
                                    audio.play();
                                }
                            }
                            else {
                                keyElement.style.background = "grey"; 
                            }
                        }
                    });

                    window.addEventListener("keyup", (event) => {
                        if (event.keyCode === 16)
                        {
                            if (this.properties.shift) { 
                                this._toggleShift(); 
                                setTimeout(function() { keyElement.style.background = "" }, 0); 
                                keyElement.classList.toggle("keyboard__key--active", this.properties.shift); 
                            }
                            if (this.properties.sounds)
                            {
                                const audio = document.querySelector('audio[data-key="shift"]');
                                audio.currentTime = 0;
                                audio.play();
                            }
                        }
                    });

                    keyElement.addEventListener("click", () => {
                        this._toggleShift();
                        if (keyElement.style.background === "grey")
                        {
                            keyElement.style.background = "";
                        }
                        if (this.properties.sounds)
                        {
                            const audio = document.querySelector('audio[data-key="shift"]');
                            audio.currentTime = 0;
                            audio.play();
                        }
                        keyElement.classList.toggle("keyboard__key--active", this.properties.shift);
                    });

                    break;
                
                case "backspace":
                    keyElement.classList.add("keyboard__key--wide");
                    keyElement.innerHTML = createIconHTML("backspace");

                    window.addEventListener("keydown", (event) => {
                        if (event.keyCode === 8)
                        {
                            event.preventDefault();
                            keyElement.click();
                            keyElement.style.background = "grey";
                            setTimeout(function() { keyElement.style.background = "" }, 200);
                            if (this.properties.sounds)
                            {
                                const audio = document.querySelector('audio[data-key="backspace"]');
                                audio.currentTime = 0;
                                audio.play();
                            }
                        }
                    });

                    keyElement.addEventListener("click", () => {
                        this.cursor.position = textArea.selectionStart;
                        if (textArea.selectionStart === textArea.selectionEnd)
                        {
                            this.properties.value = this.properties.value.substr(0, this.cursor.position - 1) + this.properties.value.substr(this.cursor.position, );
                            this.deleted.moreThanOne = false;
                        }
                        else
                        {
                            this.properties.value = this.properties.value.substring(0, textArea.selectionStart) + this.properties.value.substring(textArea.selectionEnd, );
                            this.deleted.moreThanOne = true;
                        }
                        this._triggerEvent("oninput");
                        if (this.cursor.position > 0 && !this.deleted.moreThanOne)
                        {
                            textArea.selectionStart = this.cursor.position - 1;
                            textArea.selectionEnd = this.cursor.position - 1;
                        }
                        else if (this.cursor.position > 0 && this.deleted.moreThanOne)
                        {
                            textArea.selectionStart = this.cursor.position;
                            textArea.selectionEnd = this.cursor.position;
                        }
                        else if (this.cursor.position === 0 && this.deleted.moreThanOne)
                        {
                            textArea.selectionStart = 0;
                            textArea.selectionEnd = 0;
                        }
                        if (this.properties.sounds)
                        {
                            const audio = document.querySelector('audio[data-key="backspace"]');
                            audio.currentTime = 0;
                            audio.play();
                        }
                    });

                    break;

                case "caps":
                    keyElement.classList.add("keyboard__key--wide", "keyboard__key--activatable");
                    keyElement.innerHTML = createIconHTML("keyboard_capslock");

                    window.addEventListener("keydown", (event) => {
                        if (event.keyCode === 20)
                        {
                            if (!this.properties.capsLock) { 
                                this._toggleCapsLock(); 
                                keyElement.style.background = "grey";
                                keyElement.classList.toggle("keyboard__key--active", this.properties.capsLock); 
                            }
                            else if (this.properties.capsLock && keyElement.style.background === "grey") { 
                                this._toggleCapsLock(); 
                                keyElement.style.background = "";
                                keyElement.classList.toggle("keyboard__key--active", this.properties.capsLock); 
                            }
                            else {
                                this._toggleCapsLock();
                                keyElement.style.background = "grey"; 
                                setTimeout(function() { keyElement.style.background = "" }, 200);
                                keyElement.classList.toggle("keyboard__key--active", this.properties.capsLock); 
                            }
                            if (this.properties.sounds)
                            {
                                const audio = document.querySelector('audio[data-key="caps"]');
                                audio.currentTime = 0;
                                audio.play();
                            }
                        }
                    });
                    
                    keyElement.addEventListener("click", () => {
                        this._toggleCapsLock();
                        if (keyElement.style.background === "grey")
                        {
                            keyElement.style.background = "";
                        }
                        if (this.properties.sounds)
                        {
                            const audio = document.querySelector('audio[data-key="caps"]');
                            audio.currentTime = 0;
                            audio.play();
                        }
                        keyElement.classList.toggle("keyboard__key--active", this.properties.capsLock);
                    });

                    break;

                case "enter":
                    keyElement.classList.add("keyboard__key", "keyboard__key--wide");
                    keyElement.innerHTML = createIconHTML("keyboard_return");

                    window.addEventListener("keydown", (event) => {
                        if (event.keyCode === 13)
                        {
                            event.preventDefault();
                            keyElement.click();
                            keyElement.style.background = "grey";
                            setTimeout(function() { keyElement.style.background = "" }, 200);
                            if (this.properties.sounds)
                            {
                                const audio = document.querySelector('audio[data-key="enter"]');
                                audio.currentTime = 0;
                                audio.play();
                            }
                        }
                    });

                    keyElement.addEventListener("click", () => {
                        this.cursor.position = textArea.selectionStart;
                        if (textArea.selectionStart === textArea.selectionEnd)
                        {
                            this.properties.value = this.properties.value.substr(0, this.cursor.position) + "\n" + this.properties.value.substr(this.cursor.position, );
                        }
                        else 
                        {
                            this.properties.value = this.properties.value.substring(0, textArea.selectionStart) + "\n" + this.properties.value.substring(textArea.selectionEnd, );
                        }
                        this._triggerEvent("oninput");
                        textArea.selectionStart = this.cursor.position + 1;
                        textArea.selectionEnd = this.cursor.position + 1;
                        if (this.properties.sounds)
                        {
                            const audio = document.querySelector('audio[data-key="enter"]');
                            audio.currentTime = 0;
                            audio.play();
                        }
                    });

                    break;

                case "space":
                    keyElement.classList.add("keyboard__key--extra-wide");
                    keyElement.innerHTML = createIconHTML("space_bar");

                    window.addEventListener("keydown", (event) => {
                        if (event.keyCode === 32)
                        {
                            event.preventDefault();
                            keyElement.click();
                            keyElement.style.background = "grey";
                            setTimeout(function() { keyElement.style.background = "" }, 200);
                            if (this.properties.sounds && this.properties.lang === "en")
                            {
                                const audio = document.querySelector('audio[data-key="spacebar_en"]');
                                audio.currentTime = 0;
                                audio.play();
                            }
                            else if (this.properties.sounds && this.properties.lang === "ru")
                            {
                                const audio = document.querySelector('audio[data-key="spacebar_ru"]');
                                audio.currentTime = 0;
                                audio.play();
                            }
                        }
                    });

                    keyElement.addEventListener("click", () => {
                        this.cursor.position = textArea.selectionStart;
                        if (textArea.selectionStart === textArea.selectionEnd)
                        {
                            this.properties.value = this.properties.value.substr(0, this.cursor.position) + " " + this.properties.value.substr(this.cursor.position, );
                        }
                        else 
                        {
                            this.properties.value = this.properties.value.substring(0, textArea.selectionStart) + " " + this.properties.value.substring(textArea.selectionEnd, );
                        }
                        this._triggerEvent("oninput");
                        textArea.selectionStart = this.cursor.position + 1;
                        textArea.selectionEnd = this.cursor.position + 1;
                        if (this.properties.sounds && this.properties.lang === "en")
                        {
                            const audio = document.querySelector('audio[data-key="spacebar_en"]');
                            audio.currentTime = 0;
                            audio.play();
                        }
                        else if (this.properties.sounds && this.properties.lang === "ru")
                        {
                            const audio = document.querySelector('audio[data-key="spacebar_ru"]');
                            audio.currentTime = 0;
                            audio.play();
                        }
                    });

                    break;

                case "hide":
                    keyElement.classList.add("keyboard__key--wide", "keyboard__key--dark");
                    keyElement.innerHTML = createIconHTML("keyboard_hide");

                    keyElement.addEventListener("click", () => {
                        this.close();
                        this._triggerEvent("onclose");
                        textArea.blur();
                    });

                    break;
                    
                default:
                    keyElement.textContent = key.toLowerCase();
                    keyElement.setAttribute("id", "k_" + this.keyboardKeyCodes.keyCodes[counter]);

                    counter += 1;
                    
                    keyElement.addEventListener("click", () => {
                        this.cursor.position = textArea.selectionStart;
                        if (textArea.selectionStart === textArea.selectionEnd)
                        {
                            this.properties.value = this.properties.value.substr(0, this.cursor.position) + keyElement.textContent + this.properties.value.substr(this.cursor.position, );
                        }
                        else 
                        {
                            this.properties.value = this.properties.value.substring(0, textArea.selectionStart) + keyElement.textContent + this.properties.value.substring(textArea.selectionEnd, );
                        }
                        this._triggerEvent("oninput");
                        textArea.selectionStart = this.cursor.position + 1;
                        textArea.selectionEnd = this.cursor.position + 1;
                        if (this.properties.sounds && this.properties.lang === "en")
                        {
                            const audio = document.querySelector('audio[data-key="all_en"]');
                            audio.currentTime = 0;
                            audio.play();
                        } 
                        else if (this.properties.sounds && this.properties.lang === "ru") 
                        {
                            const audio = document.querySelector('audio[data-key="all_ru"]');
                            audio.currentTime = 0;
                            audio.play();
                        }
                    });

                    break;
            }

            fragment.appendChild(keyElement);

            if (insertLineBrake) {
                fragment.appendChild(document.createElement("br"));
            }
        });

        return fragment;
    },

    _triggerEvent(handlerName) {
        if (typeof this.eventHandlers[handlerName] == "function") {
            this.eventHandlers[handlerName](this.properties.value);
        }
    },

    _toggleCapsLock() {
        this.properties.capsLock = !this.properties.capsLock;

        if (this.properties.shift)
        {
            for (const key of this.elements.keys) {
                if (key.childElementCount === 0) {
                    key.textContent = this.properties.capsLock ? key.textContent.toLowerCase() : key.textContent.toUpperCase();
                }
            }
        } 
        else {
            for (const key of this.elements.keys) {
                if (key.childElementCount === 0) {
                    key.textContent = this.properties.capsLock ? key.textContent.toUpperCase() : key.textContent.toLowerCase();
                }
            }
        }
    },

    _toggleShift() {
        this.properties.shift = !this.properties.shift;
        if (this.properties.lang === "en")
        {
            for (let i = 0; i < 13; i++){
                if (i > 0 && i < 11)
                {
                    this.elements.keys[i].textContent = this.properties.shift ? this.shiftLayout.keys_en[i] : (i % 10);
                }
                else 
                {
                    this.elements.keys[i].textContent = this.properties.shift ? this.shiftLayout.keys_en[i] : this.keyLayoutLanguage.en[i];
                }
            }
            this.elements.keys[24].textContent = this.properties.shift ? this.shiftLayout.keys_symbols_en_on[0] : this.shiftLayout.keys_symbols_en_off[0];
            this.elements.keys[25].textContent = this.properties.shift ? this.shiftLayout.keys_symbols_en_on[1] : this.shiftLayout.keys_symbols_en_off[1];
            this.elements.keys[36].textContent = this.properties.shift ? this.shiftLayout.keys_symbols_en_on[2] : this.shiftLayout.keys_symbols_en_off[2];
            this.elements.keys[37].textContent = this.properties.shift ? this.shiftLayout.keys_symbols_en_on[3] : this.shiftLayout.keys_symbols_en_off[3];
            this.elements.keys[38].textContent = this.properties.shift ? this.shiftLayout.keys_symbols_en_on[4] : this.shiftLayout.keys_symbols_en_off[4];
            this.elements.keys[48].textContent = this.properties.shift ? this.shiftLayout.keys_symbols_en_on[5] : this.shiftLayout.keys_symbols_en_off[5];
            this.elements.keys[49].textContent = this.properties.shift ? this.shiftLayout.keys_symbols_en_on[6] : this.shiftLayout.keys_symbols_en_off[6];
            this.elements.keys[50].textContent = this.properties.shift ? this.shiftLayout.keys_symbols_en_on[7] : this.shiftLayout.keys_symbols_en_off[7];
        }
        else {
            for (let i = 0; i < 13; i++){
                if (i > 0 && i < 11)
                {
                    this.elements.keys[i].textContent = this.properties.shift ? this.shiftLayout.keys_ru[i] : (i % 10);
                }
                else 
                {
                    this.elements.keys[i].textContent = this.properties.shift ? this.shiftLayout.keys_ru[i] : this.keyLayoutLanguage.ru[i];
                }
            }
            this.elements.keys[24].textContent = this.properties.shift ? this.shiftLayout.keys_symbols_ru_on[0] : this.shiftLayout.keys_symbols_ru_off[0];
            this.elements.keys[25].textContent = this.properties.shift ? this.shiftLayout.keys_symbols_ru_on[1] : this.shiftLayout.keys_symbols_ru_off[1];
            this.elements.keys[36].textContent = this.properties.shift ? this.shiftLayout.keys_symbols_ru_on[2] : this.shiftLayout.keys_symbols_ru_off[2];
            this.elements.keys[37].textContent = this.properties.shift ? this.shiftLayout.keys_symbols_ru_on[3] : this.shiftLayout.keys_symbols_ru_off[3];
            this.elements.keys[38].textContent = this.properties.shift ? this.shiftLayout.keys_symbols_ru_on[4] : this.shiftLayout.keys_symbols_ru_off[4];
            this.elements.keys[48].textContent = this.properties.shift ? this.shiftLayout.keys_symbols_ru_on[5] : this.shiftLayout.keys_symbols_ru_off[5];
            this.elements.keys[49].textContent = this.properties.shift ? this.shiftLayout.keys_symbols_ru_on[6] : this.shiftLayout.keys_symbols_ru_off[6];
            this.elements.keys[50].textContent = this.properties.shift ? this.shiftLayout.keys_symbols_ru_on[7] : this.shiftLayout.keys_symbols_ru_off[7];
        }
        if (this.properties.capsLock) {
            for (const key of this.elements.keys) {
                if (key.childElementCount === 0) {
                    key.textContent = this.properties.shift ? key.textContent.toLowerCase() : key.textContent.toUpperCase();
                }
            }
        } 
        else {
            for (const key of this.elements.keys) {
                if (key.childElementCount === 0) {
                    key.textContent = this.properties.shift ? key.textContent.toUpperCase() : key.textContent.toLowerCase();
                }
            }
        }
    },

    _toggleLanguage() {
        this.properties.lang = this.properties.lang === "en" ? "ru" : "en";
        Keyboard.elements.keys[52].innerHTML = Keyboard.elements.keys[52].innerHTML.substr(0,38);
        Keyboard.elements.keys[0].textContent = this.properties.lang === "en" ? this.keyLayoutLanguage.en[0] : this.keyLayoutLanguage.ru[0][0];

        for (let i = 14; i < 26; i++)
        {
            this.elements.keys[i].textContent = this.properties.lang === "en" ? this.keyLayoutLanguage["en"][i] : this.keyLayoutLanguage["ru"][i];
        }
        for (let j = 27; j < 39; j++)
        {
            this.elements.keys[j].textContent = this.properties.lang === "en" ? this.keyLayoutLanguage["en"][j] : this.keyLayoutLanguage["ru"][j];
        }
        for (let k = 41; k < 51; k++)
        {
            this.elements.keys[k].textContent = this.properties.lang === "en" ? this.keyLayoutLanguage["en"][k] : this.keyLayoutLanguage["ru"][k];
        }
    },

    _toggleVoiceWrite() {
        this.properties.voice = !this.properties.voice;
        record.lang = this.properties.lang === "en" ? "en-US" : "ru-RU";
        if (this.properties.voice)
        {
            record.start();
        }
        else if (!this.properties.voice)
        {
            record.stop();
        }
    },

    _toggleSounds() {
        this.properties.sounds = !this.properties.sounds;
    },

    open(initialValue, oninput, onclose) {
        this.properties.value = initialValue || "";
        this.eventHandlers.oninput = oninput;
        this.eventHandlers.onclose = onclose;
        this.elements.main.classList.remove("keyboard--hidden");
    },

    close() {
        this.properties.value = "";
        this.eventHandlers.oninput = oninput;
        this.eventHandlers.onclose = onclose;
        this.elements.main.classList.add("keyboard--hidden");
    },
};

window.addEventListener("DOMContentLoaded", function() {
    Keyboard.init();
});
