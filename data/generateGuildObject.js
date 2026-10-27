const fs = require('fs'); 
const people = require('./config.js').settings.guilds[guildId]?.people;

/*
*   Purpose:        Generate js object for a guild from data from a text file
*
*   Parameter:      textFilePath (string)
*                       Path to text file relative to the file this function is run from
*                       The text file must be in the following format: 
*                           Each row is a separate submission
*                           Each row must contain the following in order: 
*                           Date in MM/DD/YYYY format, year must be a four digit number (e.g. 999 does not work)
*                           Time in HH:MM:SS format
*                           Alias
*                           Leetcode problem number as an integer
*                           Leetcode Problem difficulty as a string
*                           The discord link to the message, must contain "channels" and everything after it. Everything before it is optional
*                       Every item in each row must be separated by whitespace and cannot contain whitespace
*                       The submissions do not need to be sorted
* 
*   Return:         an object containing all the information from the text file
*/
function generateGuildObject(textFilePath) {
    // Checking file path is a string using code from https://stackoverflow.com/questions/4059147/check-if-a-variable-is-a-string-in-javascript
    if (!(typeof textFilePath === 'string') && !(textFilePath instanceof String)) {
        throw new Error("Parameter is not a string!"); 
    }

    let guildObject = {}; 

    // get data from the text file and store all values in a 2d array
    const rows = fs.readFileSync(textFilePath).toString().split("\n");
    const data = []; 
    for (i = 0; i < rows.length; i++) {
        data.push(rows[i].split(/\s/)); 
    }

    // sort data
    data.sort(compareFn); 

    // create object for each submission, then add it to guildObject
    for (const submissionInput of data) {
        /******************** Date & Time ********************/
        // convert date & time to date (see following definition) and unix time
        // a day is defined from 5pm UTC to 5pm UTC the next day 
        // e.g. October 25 2026 (the date this is written!) stars at October 25 5pm UTC and ends before October 26 5pm UTC

        // split the date into different arrays
        // if the month or day is a single digit, add a leading zero
        let inputDay = submissionInput[0].split("/"); 
        if (inputDay[0].length == 1) inputDay[0] = "0" + inputDay[0]; 
        if (inputDay[1].length == 1) inputDay[1] = "0" + inputDay[1]; 
        // if the hour is a single digit, add a leading zero
        if (submissionInput[1].length == 7) submissionInput[1] = "0" + submissionInput[1]; 

        // see link for specification on creating date object https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format
        // since the data is in pdt, it has an offset of -7 from UTC
        // inputDay stores the date in the order: MM, DD YYYY
        let date = new Date(inputDay[2] + "-" + inputDay[0] + "-" + inputDay[1] + "T" + submissionInput[1] + ".000-07:00"); 

        // find the day in YYYY-MM-DD format
        // date definition is defined right below Date & Time separator
        let day = ""; 
        if (date.getUTCHours() >= 17) {
            // the date is the same as the UTC day
            day = toString(date); 
        } else {
            // the date is the previous day from the current UTC day
            // modified getting next day from https://stackoverflow.com/questions/3674539/incrementing-a-date-in-javascript
            let prevDay = new Date(date.getTime()); 
            prevDay.setUTCDate(date.getUTCDate() - 1); 
            
            day = toString(prevDay); 
        }

        // find the unix time
        let unixTime = date.getTime(); 

        /******************** Leetcode Problem ********************/
        let leetcodeProblem = [Number(submissionInput[3]), submissionInput[4]]; 

        /******************** Message ID ********************/
        let start = submissionInput[5].indexOf("channels"); 
        let ids = submissionInput[5].substring(start+9); 
        let messageLink = ids.split("/"); 

        /******************** Message ID ********************/
        let id = "ERROR"; 
        let keys = Object.keys(people); 
        for (i = 0; i < keys.length; i++) {
            if (people[keys[i]] == submissionInput[2]) {
                id = keys[i]; 
                break; 
            }
        }

        /******************** Finished Formatting ********************/
        // at this point: 
        // the submission date is stored in day                     (string)
        // the id is stored in id                                   (string)
        // the leetcode problem info is stored in leetcodeProblem   (array)
            // the problem number is leetcodeProblem[0]             (int)
            // the difficulty is leetcodeProblem[1]                 (string)
        // the unix time is stored in unixTime (milliseconds)       (int)
        // the message ID is stored in messageLink                  (array)
            // the channelID is messageLink[0]                      (string)
            // the postID is messageLink[1]                         (string)
            // the messageID is messageLink[2]                      (string)

        // generate js object
        if (!(day in guildObject)) {
            guildObject[day] = {}; 
        }
        if (!(id in guildObject[day])) {
            guildObject[day][id] = []; 
        }
        guildObject[day][id].push({
            "time": unixTime, 
            "problem": {"number": leetcodeProblem[0], "difficulty": leetcodeProblem[1]}, 
            "ID": {"channel": messageLink[0], "thread": messageLink[0], "msg": messageLink[0]}
        }); 
        
        // printing for debug purposes:  
        // console.log("submission date:           " + day + "\t\tof type " + typeof(day)); 
        // console.log("alias:                     " + submissionInput[2] + "\t\t\tof type " + typeof(submissionInput[2])); 
        // console.log("unix epoch time            " + unixTime + "\tof type " + typeof(unixTime)); 
        // console.log("leetcode problem number:   " + leetcodeProblem[0] + "\t\t\tof type " + typeof(leetcodeProblem[0])); 
        // console.log("leetcode difficulty:       " + leetcodeProblem[1] + "  \t\tof type " + typeof(leetcodeProblem[1])); 
        // console.log("channelID:                 " + messageLink[0] + "\tof type " + typeof(messageLink[0])); 
        // console.log("postID:                    " + messageLink[1] + "\tof type " + typeof(messageLink[1])); 
        // console.log("messageID:                 " + messageLink[2] + "\tof type " + typeof(messageLink[2])); 
        // console.log("");
    }

    return guildObject; 
}

/*
*   Purpose:        Convert a date into a string of format YYYY-MM-DD

*   Parameter:      date(Date)
*                       Date object to convert, must be a valid Date
* 
*   Return:         a string of format YYYY-MM-DD
*/
function toString(date) {
    // Checking parameter is a valid Date object using code from https://stackoverflow.com/questions/643782/how-to-check-whether-an-object-is-a-date
    if (!date) {
        // check it is not a falsy value
        throw new Error("Parameter is not a date!"); 
    } else if (!(Object.prototype.toString.call(date) === "[object Date]")) {
        // check it is of type Date
        throw new Error("Parameter is not a date!"); 
    } else if (isNaN(date)) {
        // checks that Date object is valid
        throw new Error("Date object does not store a valid date!"); 
    }

    // note: getUTCMonth() returns January as 0
    let out = `${date.getUTCFullYear()}-`; 
    if (date.getUTCMonth() < 9) out += "0"; 
    out += `${date.getUTCMonth() + 1}-`; 
    if (date.getUTCDate() < 10) out += "0"; 
    out += `${date.getUTCDate()}`; 
    return out; 
}

/*
*   Purpose:        Helper function to sort 2d list of data
*                   Should sort in increasing order of date, the alias, then time, then problem number, and lastly discord message link
*                   WARNING: Do not use outside of generateGuildObject
*
*   Parameter:      s1 (list)
*                       a list of length 6 containing values in a row of the input data
*                   s2 (list)
*                       a list of length 6 containing values in a row of the input data
* 
*   Return:         returns -1 if s1 is before s2, 1 if s1 is after s2, and 0 if they are the same
*/
function compareFn(s1, s2) {
    // checking year then month then day
    let d1 = s1[0].split("/"); 
    let d2 = s2[0].split("/"); 
    // year
    if (parseInt(d1[2]) < parseInt(d2[2])) return -1; 
    if (parseInt(d1[2]) > parseInt(d2[2])) return 1; 
    // month
    if (parseInt(d1[0]) < parseInt(d2[0])) return -1; 
    if (parseInt(d1[0]) > parseInt(d2[0])) return 1; 
    // day
    if (parseInt(d1[1]) < parseInt(d2[1])) return -1; 
    if (parseInt(d1[1]) > parseInt(d2[1])) return 1; 

    // checking alias
    if (s1[2] < s2[2]) return -1; 
    if (s1[2] > s2[2]) return 1; 

    // checking time
    let date1 = new Date("2000" + s1[1]); 
    let date2 = new Date("2000" + s2[1]); 
    if (date1.getTime() < date2.getTime()) return -1; 
    if (date1.getTime() > date2.getTime()) return 1;  

    // checking problem number
    if (s1[3] < s2[3]) return -1; 
    if (s1[3] > s2[3]) return 1; 

    // checking discord message
    if (s1[4] < s2[4]) return -1; 
    if (s1[4] > s2[4]) return 1; 

    // they are identical
    return 0; 
}

// do the export
module.exports = {
    generateGuildObject, 
    toString
}; 