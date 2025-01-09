var crawler = require("crawler");
var spawn = require('child_process').spawn;
const fs = require("fs");
const download = require('download-file')
const rimraf = require("rimraf");
const options = {
    encoding: 'utf8',
    flag: 'w',
};
var readlineSync = require("readline-sync");
var excel = require('excel4node');

var words = "../words/";
if (!fs.existsSync(words)) {
    fs.mkdirSync(words);
}

var flag = true;
console.log("\n\n========== Welcome to words tool version-1.0.3-cambridge ============\n")
console.log("\t   ------------ written by namledzz ------------\n\n\n")

var words = "../words/";

if (!fs.existsSync(words)) {
    fs.mkdirSync(words);
}
while (flag) {
    var words_file = readlineSync.question("Input name of the file (example: words.txt)\nInput: ");
    if (words_file == undefined) {
        console.log("\nFile do not exist!")
    } else if (fs.existsSync(words + words_file)) {
        flag = false;
    } else {
        console.log("\nFile do not exist !")
    }
}



console.log("\nStarting ...\n")
console.log("=====================================================================\n")

// Start input file and convert into an array
var file = fs.readFileSync(words + words_file, { encoding: "utf8" }); // data to String.
file = file.replace(/(?:\r\n|\r|\n)/g, '\n');
var arr = file.split("\n"); // an array of every string in file.

// Finish input file

// Checking dependencies
var DOWNLOAD_DIR = '../audio/' + words_file + '/';
var fetching = "../fetching";
var result = "../result";


// Check if download dir is exist

if (!fs.existsSync(fetching)) {
    fs.mkdirSync(fetching);
}

if (!fs.existsSync(result)) {
    fs.mkdirSync(result);
}

if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR);
} else {
    rimraf.sync(DOWNLOAD_DIR);
    fs.mkdirSync(DOWNLOAD_DIR);
}

var arrayV = [];
var arrayE = [];
var arrayRes = [];
var counting = 0;
var countingE = 0;
var arrayA = [];

var c = new crawler({
    maxConnections: 5,
    // This will be called for each crawled page
    callback: function(error, res, done) {
        if (error) {
            console.log(error);
            console.log("false");
        } else {
            counting++;
            var $ = res.$;

            var title = $("#page-content .entry-body .hw .tb").first().text()
            var type = $("#page-content .entry-body div:first-child span:first-of-type .pos").first().text()
            var meaning = $("#page-content .entry-body .dictionary .dlink .di .normal-entry-body .pos-body .dsense-noh .sense-body .def-block .def-body .trans").first().text()


            var result = res.options.id + "\t" + title + "\t" + type + "\t" + meaning;

            arrayV.push(result);
            // console.log(arrayV)

            switch (counting) {
                case parseInt(arr.length / 100):
                    console.log("Fetching ...\n")
                    break;
                case parseInt(arr.length / 3):
                    console.log("\n2/3 left ...\n")
                    break;
                case parseInt(arr.length * 2 / 3):
                    console.log("\n1/3 left ...\n")
                    break;
                case parseInt(arr.length * 4 / 5):
                    console.log("\nAlmost Done ...\n")
                    break;
            }

            var new_file = arrayV.join('\n');

            fs.writeFileSync('../fetching/result.txt', new_file, options, (err) => {
                if (err) console.log(err);
            }); //write file 
        }
        done();
    }
});


var c1 = new crawler({
    maxConnections: 5,
    // This will be called for each crawled page
    callback: function(error, res, done) {
        if (error) {
            console.log(error);
            console.log("false");
        } else {
            countingE++;
            var $ = res.$;
            var title = $("#page-content h1:first-of-type .tb").text()

            var audio = "";
            if ($("#ampaudio2").children()[1] != undefined) {
                audio = "https://dictionary.cambridge.org" + ($("#ampaudio2").children()[1].attribs.src);
            } else if (($("#ampaudio1").children()[1] != undefined) && audio == "" && ($("#ampaudio2").children()[1] == undefined)) {
                audio = "https://dictionary.cambridge.org" + ($("#ampaudio1").children()[1].attribs.src);
            }

            var pron = $("#page-content .page div:first-child .link .superentry .di-body .entry .entry-body div:first-child .pos-header .us .pron .ipa").text()
            if (pron == "") {
                pron = $("#page-content .page div:first-child .link .superentry .di-body .entry .entry-body div:first-child .pos-header .uk .pron .ipa").text()
            }

            var resultE = res.options.id + "\t" + title + "\t(" + pron + ")\t" + audio;
            arrayE.push(resultE);
            var res_audio = title + "\t" + audio;
            arrayA.push(res_audio);
            // console.log(resultE);

            var new_file_E = arrayE.join('\n');
            var new_audio = arrayA.join('\n');
            fs.writeFileSync('../fetching/audio.txt', new_audio, options, (err) => {
                if (err) console.log(err);
            }); //write file
            fs.writeFileSync('../fetching/resultE.txt', new_file_E, options, (err) => {
                if (err) console.log(err);
            }); //write file 
        }
        done();
    }
});


// Add c and c1 to queue
var count = 0;
var rsId;
for (var i = 0; i < arr.length; i++) {
    count++
    rsId = arr[i].toLowerCase();
    c.queue({
        uri: "https://dictionary.cambridge.org/vi/dictionary/english-vietnamese/" + (arr[i].toLowerCase()),
        id: rsId
    });
    c1.queue({
        uri: "https://dictionary.cambridge.org/vi/dictionary/english/" + (arr[i].toLowerCase()),
        id: rsId
    });

}
// Finish add c and c1 to queue


// When c and c1 is empty
var checkCDone = false;
var checkC1Done = false;

c.on('drain', () => {
    checkCDone = true

    if (checkC1Done) {
        allDone();
    }
})

c1.on('drain', () => {
        checkC1Done = true

        if (checkCDone) {
            allDone();

        }
    })
    // End when c and c1 is empty

// Start to connect file resultE and result
function allDone() {

    // English
    var resultE = fs.readFileSync('../fetching/resultE.txt', { encoding: "utf8" }); // data to String.
    resultE = resultE.replace(/(?:\r\n|\r|\n)/g, '\n');
    var arrE = resultE.split("\n"); // an array of every string in file.
    var arrEid = []
    for (var i = 0; i < arrE.length; i++) {
        arrEid[i] = arrE[i].substring(0, arrE[i].indexOf("\t"));
    }


    //Vietnamese
    var resultV = fs.readFileSync('../fetching/result.txt', { encoding: "utf8" }); // data to String.
    resultV = resultV.replace(/(?:\r\n|\r|\n)/g, '\n');
    var arrV = resultV.split("\n"); // an array of every string in file.
    var arrVid = []
    for (var i = 0; i < arrV.length; i++) {
        arrVid[i] = arrV[i].substring(0, arrV[i].indexOf("\t"));
    }


    // Final Result
    var arrRes = [];
    for (var i = 0; i < arrEid.length; i++) {
        for (var j = 0; j < arrVid.length; j++) {
            if (arrEid[i] == arrVid[j]) {
                arrRes[i] = arrV[j] + arrE[i].substring(arrE[i].indexOf("\t("));

            }
        }
    }

    var res_file = arrRes.join('\n');
    fs.writeFileSync('../fetching/data.txt', res_file, options, (err) => {
        if (err) console.log(err);

    }); //write file
    download_media();
    create_excel();
    setTimeout(function() {
        console.log("\nClosing ...\n")
    }, 1500)
    setTimeout(function() {}, 3000);

}

// Finish connect file resultE and result


// Start function download media
function download_media() {
    var file = fs.readFileSync("../fetching/audio.txt", { encoding: "utf8" }); // data to String.
    file = file.replace(/(?:\r\n|\r|\n)/g, '\n');
    var arr = file.split("\n"); // an array of every string in file.
    for (var i = 0; i < arr.length; i++) {
        var file_name = arr[i].substring(0, arr[i].indexOf("\t"))
        var file_url = arr[i].substring(arr[i].indexOf("\t") + 1)
        if ((file_name != "") && (file_url != "")) {
            file_to_Check = DOWNLOAD_DIR + file_name + ".mp3";
            file_name = file_name + ".mp3";
            if (!fs.existsSync(file_to_Check)) {
                var optional = {
                    directory: DOWNLOAD_DIR,
                    filename: file_name
                }
                download(file_url, optional, function(err) {
                    if (err) console.log(err)
                })
            }
        }
    }
}
// End function download file


function create_excel() {
    // Start add to Excel 

    // Create a new instance of a Workbook class
    var workbook = new excel.Workbook();

    // Add Worksheets to the workbook
    var worksheet = workbook.addWorksheet('Sheet 1');

    // Create a reusable style
    var style = workbook.createStyle({
        font: {
            size: 12
        },

    });


    var final = fs.readFileSync('../fetching/data.txt', { encoding: "utf8" }); // data to String.
    final = final.replace(/(?:\r\n|\r|\n)/g, '\n');
    var array_final = final.split("\n"); // an array of every string in file.


    // Start Create new 2D array
    var arrResult = [];
    var col = 6;
    for (var i = 0; i < array_final.length; i++) {
        arrResult[i] = [];
    }
    var search = "\t";
    var indexNow = 0;
    var next = 0;
    for (var i = 0; i < array_final.length; i++) {
        for (var j = 0; j < col; j++) {
            if (j == 5) {
                next = array_final[i].length;
                arrResult[i][j] = array_final[i].substring(indexNow, next)
            } else {
                next = array_final[i].indexOf(search, indexNow);
                arrResult[i][j] = array_final[i].substring(indexNow, next);
                indexNow = next + 1;
            }
        }
        indexNow = 0;
        next = 0;
    }
    // Finish create new 2D array 


    // Add array into worksheet 
    for (var i = 0; i < array_final.length; i++) {
        for (var j = 0; j < col; j++) {
            worksheet.cell(i + 1, j + 1).string(arrResult[i][j]).style(style)
        }
    }

    console.log("\nExporting ...")

    workbook.write('../result/' + words_file.substring(0, words_file.indexOf(".")) + '.xlsx');

    setTimeout(() => {
        console.log("\n============================= Done ^_^ ==============================\n");
    }, 500)



    // Finish add to Excel
}