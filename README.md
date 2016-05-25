# JSP
__________________________

#####Long story short: 
As of now (May 2016) [JsPerf](https://jsperf.com/)  is offline since 2 months or more so, the need to test codes led me to build this small jsperf-like application to use until jsperf will comeback in [v2](https://github.com/jsperf/jsperf.com)

I didn't add a database to store the test-case created (since it was the jsperf's main problem), 
Instead I choosed to save the current test-case in `localStorage` and the ability to **export** it. 

__________________________
#####What I used:
 - [benchmarkjs](https://benchmarkjs.com/): which sould be used by jsperf too
 - [Blob pages](https://developer.mozilla.org/en-US/docs/Web/API/Blob): used to create local pages for testing on runtime
 
__________________________
#####How to use it:
 - _SAVE_: Save (with a name) the current test-case into your browser `localStorage`;
 - _OPEN_: the gray area lists the saved test cases, the white area on the right contains the code of test-case to be loaded;
 - _EXPORT_: Give the current test-case code, ready to be copy-pasted where you need it,
 - _ADD_: Insert a case-block. The block can be removed, resetted and moved up and down and the title is required to be more than 2 characters long;
 - _RUN_: generates and opens the page that is used to run the test cases.


__________________________
#####Example:
Copy-pase this code in the **LOAD** panel 
```
{"initialHtml":"%3Cdiv%20id%3D%22foo%22%3E%3C%2Fdiv%3E","preCase":"","postCase":"","cases":[{"name":"getElementById","code":"var%20el%20%3D%20document.getElementById(%22foo%22)%3B"},{"name":"querySelector","code":"var%20el%20%3D%20document.querySelector(%22%23foo%22)%3B"}]}
```
__________________________
###Page: [https://rawgit.com/Lor-Saba/jsp/master/](https://rawgit.com/Lor-Saba/jsp/master/)
