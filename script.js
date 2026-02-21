import { omikujiList, messageList, prefs } from "./lists.js";

const apiKey = "2f17f89bff90ad41b3fe7324180cd58f";
let flag = 0;
let exFlag = 0;

//県のオプションを生成
const select = document.getElementById("pref");
prefs.forEach(pref => {
    const option = document.createElement("option");
    option.value = pref;
    option.textContent = pref;
    select.appendChild(option);
});

//おみくじボタンと結果表示エリアの取得
const omikujiBtn = document.getElementById("omikuji-btn");
const omikujiArea = document.getElementById("omikuji-area");
const messageArea = document.getElementById("message-area");
const wetherArea = document.getElementById("wether-area");
const wetherprobArea = document.getElementById("wetherprob-area");
const loadingArea = document.getElementById("loading-area");
const ex = document.getElementById("ex");

//おみくじの処理
omikujiBtn.addEventListener("click", async () => {
    if (exFlag == 0) {
        ex.classList.add("hidden");
        exFlag = 1;
    }
    omikujiBtn.disabled = true;
    resultAreaHidden();
    loadingArea.classList.remove("hidden");
    await loading(700);
    const pref = document.getElementById("pref").value;
    try {
        const result = await getWeather(pref, apiKey);
        console.log(result.id);
        const randomIndexSetObject = randomIndexSet(result.id);
        wetherArea.innerHTML = `<span class="text-[80%]">天気:</span> <span class="font-bold">${result.res}</span>`;
        wetherprobArea.innerHTML = `<span class="text-[80%]">大吉の確率:</span> <span class="font-bold">${randomIndexSetObject.prob * 100}%</span>`;
        omikujiArea.innerHTML = `<span class=${randomIndexSetObject.color}>${omikujiList[randomIndexSetObject.randomIndex]}</span>`;
        messageArea.textContent = messageList[randomIndexSetObject.randomIndex];
        setConfetti(randomIndexSetObject.randomIndex);
    } catch {
        const messageBox = document.createElement("div");
        messageBox.classList.add("bg-red-400", "fixed", "top-0", "w-full", "flex", "justify-center", "items-center")
        const flashMessage = document.createElement("p");
        flashMessage.textContent = "エラーが発生しました!!";
        flashMessage.classList.add("text-white", "top-0", "left-0", "text-xl", "font-bold", "px-1");
        document.body.appendChild(messageBox);
        messageBox.appendChild(flashMessage);
        setTimeout(()=>{
            messageBox.remove();
        }, 3000);
    } finally {
        loadingArea.classList.add("hidden");
        resultAreaHidden()
        omikujiBtn.disabled = false;
    }
});

//天気取得関数getWeatherの定義
async function getWeather(cityName, apiKey) {
    let result;
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&lang=${"ja"}`);
    if (response.ok == true) {
        const data = await response.json();
        console.log(data);
        const wetherId = data.weather[0].id;
        console.log(wetherId);
        if (800 <= wetherId && wetherId <= 802) {
            result = { id: 1, res: "晴れ" };
        } else if (803 <= wetherId && wetherId <= 804) {
            result = { id: 2, res: "曇り" };
        } else if (600 <= wetherId && wetherId <= 622) {
            result = { id: 3, res: "雪" };
        } else if (500 <= wetherId && wetherId <= 531) {
            result = { id: 4, res: "雨" };
        } else if (300 <= wetherId && wetherId <= 321) {
            result = { id: 5, res: "霧雨" };
        } else if (200 <= wetherId && wetherId <= 232) {
            result = { id: 6, res: "雷雨" };
        } else {
            result = { id: 7, res: "その他" };
        }
        console.log(result);
        return result;
    }else{
        throw new Error("Error!!");
    }
}

//resultAreaを有効化する関数
function resultAreaHidden() {
    const resultArea = document.getElementById("result-area");
    if (flag == 0) {
        resultArea.classList.add("hidden");
        flag = 1;
    } else {
        resultArea.classList.remove("hidden");
        flag = 0;
    }
}

//天気idを引数で受け取ってから確率を求め、omikujiListのインデックス番号と確率を返す関数
function randomIndexSet(id) {
    let prob;
    let color;
    let randomIndex;
    //天気idによって確率を変える処理
    switch (id) {
        case 1:
            prob = 0.4;//晴れ
            break;
        case 2:
            prob = 0.1;//曇り
            break;
        case 3:
            prob = 0.3;//雪
            break;
        case 4:
            prob = 0.05;//雨
            break;
        case 5:
            prob = 0.1;//霧雨
            break;
        case 6:
            prob = 0.02;//雷雨
            break;
        case 7:
            prob = null;//その他(完全ランダムにする)
            break;
    }
    let r = Math.random();
    if (r <= prob && prob != null) {
        randomIndex = 6;
    } else if (prob == null) {//天気がその他だった場合は完全ランダムにする
        randomIndex = Math.floor(Math.random() * omikujiList.length);
        prob = 0.14;
    } else {
        randomIndex = Math.floor(Math.random() * (omikujiList.length - 1));//大吉以外をランダムに指定する
    }
    switch (randomIndex) {
        case 0:
            color = "text-purple-600";
            break;
        case 1:
            color = "text-purple-500";
            break;
        case 2:
            color = "text-blue-500";
            break;
        case 3:
            color = "text-blue-300";
            break;
        case 4:
            color = "text-gray-500";
            break;
        case 5:
            color = "text-yellow-500";
            break;
        case 6:
            color = "text-red-500";
            break;
    }
    return { randomIndex: randomIndex, prob: prob, color: color };//求めたインデックス番号と確率を、オブジェクトとして返す。
}

//ローディング関数
function loading(ms) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}

//大吉の場合のみコンフェッティを出す関数
function setConfetti(index) {
    if (index == 6) {
        confetti({
            particleCount: 100,
            spread: 80,
        });
    }
}