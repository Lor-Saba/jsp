# JPS 
__________________________

#####Long story short: 
[JsPerf](https://jsperf.com/) is offline since ~2 or more months now so, the need to test codes led me to build a small jsperf-like application for myself to use until jsperf will comeback in [v2](https://github.com/jsperf/jsperf.com)

I didn't add a database to store the test-case created (since it was the jsperf's main problem), 
Instead I choose to save the current test-case in `localStorage` and the ability to **export** it. 

__________________________
#####What I used to realize it:
 - [benchmarkjs](https://benchmarkjs.com/): which sould be used by jsperf too
 - [Blob pages](https://developer.mozilla.org/en-US/docs/Web/API/Blob): used to create local pages for testing on runtime
 
__________________________
#####How to use it:
 - _SAVE_: Save (whith a name) the current test-case into your browser `localStorage` ,
 - _OPEN_: the grey area on the left lists your saved test-cases, the white area on the right contain the test-case code to be loaded,
 - _EXPORT_: Give the current test-case code, ready to be copy-pasted where you need it,
 - _ADD_: Insert a case-block. (the title must be >=3 char long)  you can remove, reset (clean the inputs, move up-down the case-block using his buttons list)
 - _RUN_: generate and open the test-page where you can run the test-case.


__________________________
#####Example:
Copy-pase this code in the **LOAD** panel 
```
{"initialHtml":"%3Cdiv%20id%3D%22foo%22%3E%3C%2Fdiv%3E","preCase":"","postCase":"","cases":[{"name":"getElementById","code":"var%20el%20%3D%20document.getElementById(%22foo%22)%3B"},{"name":"querySelector","code":"var%20el%20%3D%20document.querySelector(%22%23foo%22)%3B"}]}
```
__________________________
###Page: [https://rawgit.com/Lor-Saba/jsp/master/](https://rawgit.com/Lor-Saba/jsp/master/)
