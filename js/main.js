
	var elTestContainer,
		elTS_initialHtml,
		elTS_preCase,
		elTS_postCase,
		storage,
		lastUrl,
		globalToggle;

	function init(){

		removeNewLinesFromHTML();

		//ace.require("ace/ext/language_tools");
		
		elTestContainer  = document.getElementById('test-container');
		elTS_initialHtml = document.querySelector('#test-stuff textarea.test-initialhtml') 	|| {};  // newEditor(document.querySelector('#test-stuff div.test-initialhtml'), "html");
		elTS_preCase 	 = document.querySelector('#test-stuff textarea.test-precase') 		|| {};
		elTS_postCase 	 = document.querySelector('#test-stuff textarea.test-postcase') 	|| {};
		storage 		 = localStorage['jsb_tests'] ? JSON.parse(localStorage['jsb_tests']) : []; 
		lastUrl 		 = null;
		globalToggle	 = false;
		
		var hashUrl = location.hash.slice(1);
		if (hashUrl.trim().length > 0)
			loadFromUrl(hashUrl);
		
		window.addEventListener("mouseup", function(_e){
	
			var found = parents(_e.target, function(_el){ 
				return _el.className === "test-panel";
			});
	
			if (!found) hidePanels();
		});
		window.addEventListener("keydown", function(_e){
	
			if (_e.keyCode === 83 && _e.ctrlKey){
				_e.preventDefault();
				
				saveCurrentToStorage(document.querySelector('#panel-save input.code').value);
			}
		});
	}
	function newEditor(_el, _type){
		_type = _type ? _type : "javascript";

	    var editor = ace.edit(_el);
		    editor.setTheme("ace/theme/chrome");
		    editor.getSession().setMode("ace/mode/"+_type);
		    editor.setPrintMarginColumn(false)
		    editor.renderer.setShowGutter(false);
		    editor.setOptions({
	    		enableBasicAutocompletion: true
			});

		var returnData = {
			get el(){ return _el; },
			get editor(){ return editor; },
			get value(){ return editor.getValue(); },
			set value(_text){
				editor.setValue(typeof _text === "string" ? _text : "");
			},
			destroy: function(){
				editor.removeAllListeners();
				editor.destroy();
				//editor.container.remove();

				while (_el.firstChild) 
    				   _el.removeChild(_el.firstChild);
			}
		};

		return returnData;
	}
	function loadFromUrl(_url){
		
		var xhr = new XMLHttpRequest();
		    xhr.onload = function(_r){ 
		    	try{
		    		var json = JSON.parse( _r.target.responseText );
		    		if (json.error) console.error(json);
		    		
		    		loadFromJson(json);
		    	}
		    	catch(_er){ }
		    };
		    xhr.onerror = function(_r){ 
		    	console.log(arguments);
		    };
		    
		    //xhr.open("GET", "get-pbraw.php?pbid="+_url, true);
		    xhr.open("GET", "get-pastebin.php?pbid="+_url, true);
		    xhr.send();
		    
	}
	function removeNewLinesFromHTML(){ 

		var n, nodes = [], walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    	while (n = walk.nextNode()) nodes.push(n);
    
    	for(var ind = nodes.length-1; ind >= 0; ind--) 
    		if(nodes[ind].textContent.trim() === "" 
            &&  /\n/g.test(nodes[ind].textContent))
            	nodes[ind].parentElement.removeChild(nodes[ind]);
        
	}
	function addTestCase(_title, _code){

		_title = _title ? _title : '';
		_code  = _code  ? _code  : '';

		var elTest = document.createElement('div');
			elTest.className = "case";
			elTest.innerHTML = `

				<input type="text" class="title" placeHolder="Title.." value="`+_title+`" spellcheck="false">
				<textarea class="code" placeHolder="Code.." spellcheck="false">`+_code+`</textarea>
				<button  class="btn remove" 	title="Remove" 		onclick="removeTestCase(this)"><i class="fa fa-times" aria-hidden="true"></i><label>Confirm?</label></button
				><button class="btn reset"  	title="Reset" 		onclick="resetTestCase(this.parentElement)"><i class="fa fa-undo" aria-hidden="true"></i></button
				><button class="btn move-up" 	title="Move UP" 	onclick="moveCase(this.parentElement, 'up')"><i class="fa fa-chevron-up" aria-hidden="true"></i></button
				><button class="btn move-down" 	title="Move DOWN" 	onclick="moveCase(this.parentElement, 'down')"><i class="fa fa-chevron-down" aria-hidden="true"></i></button
				><button class="btn toggle" 	title="Toggle" 	    onclick="toggleCase(this.parentElement)"><i class="fa fa-eye" aria-hidden="true"></i></button>

			`;

		elTestContainer.appendChild(elTest);

		window.scrollTo(0, document.body.scrollHeight)
	}
	function saveStorage(){

		localStorage['jsb_tests'] = JSON.stringify(storage);	
	}
	function saveCurrentToStorage(_name){
		if (typeof _name === "string"
		&&  _name.length > 2){

			var test = storage.find(function(_test){ return _test.name === _name});
			if (test && confirm("'' "+_name+" '' already exist\nOverwrite and continue?")) {
				test.test = getCurrentTestObject();
				hidePanels();
			}
			else if (!test){
				storage.push({ name:_name, test:getCurrentTestObject() });
				hidePanels();
			}

			saveStorage();
		}
		else{ 
			showPanel('save');
			alert('Type a valid name to save the current test.');
		}
	}
	function loadFromStorage(_ind){
		var test = getFromStorage(_ind);
		if (test) loadFromJson(test);
	}
	function getFromStorage(_ind){
		if (storage[_ind]) return storage[_ind].test;
		else return null;
	}
	function loadFromJson(_json){
		try{
			if (typeof _json === "string")
				_json = JSON.parse(_json);

			if (_json.cases && _json.cases.constructor === Array){
				elTestContainer.innerHTML = '';
				for(var ind = 0, ln = _json.cases.length; ind < ln; ind++)
					addTestCase(
						decodeURIComponent(_json.cases[ind].name), 
						decodeURIComponent(_json.cases[ind].code)
					);
			}
				
			elTS_initialHtml.value 	= decodeURIComponent(_json.initialHtml);
			elTS_preCase.value 		= decodeURIComponent(_json.preCase);
			elTS_postCase.value 	= decodeURIComponent(_json.postCase);
			
			hidePanels();
		}
		catch(_ex){}
	}
	function removeTestCase(_el){
		
		if (_el.getAttribute('data-confirm') != "true"){
			_el.setAttribute('data-confirm', true);
			_el.onmouseleave = function(){
				_el.setAttribute('data-confirm', false);
			}
		}
		else 
			elTestContainer.removeChild(_el.parentElement);
	}
	function resetTestCase(_el){
		_el.querySelector(".title").value = '';
		_el.querySelector(".code").value = '';
	}
	function moveCase(_el, _dir){
		if (_dir.toUpperCase() === "UP" 
		&&  _el.previousElementSibling)
			_el.parentElement.insertBefore(_el, _el.previousElementSibling);

		else 
		if (_dir.toUpperCase() === "DOWN" 
		&&  _el.nextElementSibling)
			_el.parentElement.insertBefore(_el.nextElementSibling, _el);
	}
	function toggleCase(_el, _force){
		var state = _el.getAttribute('data-toggled') === "true" ? false : true;
		if (_force !== undefined) 
			state = !!_force;
			
		_el.setAttribute('data-toggled', state);
	}
	function toggleCases(){
		globalToggle = !globalToggle;
		
		for(var ind = 0, els = elTestContainer.querySelectorAll('.case'), ln = els.length; ind < ln; ind++)
			toggleCase(els[ind], globalToggle);
			
		// collapseArea('stuff', globalToggle);
		window.scrollTo(0, document.body.scrollHeight);
	}
	function clearTest(){
		if (confirm("Are you sure to clear the current state of the test?")){
			elTestContainer.innerHTML 	= '';
			elTS_initialHtml.value 		= '';
			elTS_preCase.value 			= '';
			elTS_postCase.valu			= '';
			globalToggle	 			= false;
		}
	}
	function collapseArea(_name, _force){
		var elArea = document.querySelector('.collapse-'+_name);
		if (elArea) {
			
			var state = elArea.style.display === "none" ? "block" : "none";
			if (_force !== undefined) 
				state = !_force ? "block" : "none";
				
			elArea.style.display = state;
			
		}

		return elArea;
	}
	function makeElement(_html){
		var elt = document.createElement("div");
			elt.innerHTML = _html;

		return elt.children[0];
	}
	function getCurrentTestObject(){
		var data = {

			initialHtml: 	encodeURIComponent(elTS_initialHtml.value	|| ''),
			preCase: 		encodeURIComponent(elTS_preCase.value 		|| ''),
			postCase: 		encodeURIComponent(elTS_postCase.value 		|| ''),

			cases: []

		};

		for(var ind = 0, els = document.querySelectorAll('.case'), ln = els.length; ind < ln; ind++){
			if (els[ind].querySelector(".title").value.length > 2
			&&  els[ind].querySelector(".code").value.length > 0)
				data.cases.push({
					name: encodeURIComponent(els[ind].querySelector(".title").value),
					code: encodeURIComponent(els[ind].querySelector(".code").value)
				});
		}

		return data;
	}
	function buildLoad(){

		var elLoadCode = document.querySelector('#panel-load textarea.code');
		var elTestsList = document.querySelector('.tests-list');
			elTestsList.innerHTML = '';

		for(var ind = 0, ln = storage.length; ind < ln; ind++){
			var el = makeElement("<li data-index='"+ind+"'>"+storage[ind].name+"<span>&#10006;</span></li>");
				el.ondblclick = function(){
					loadFromStorage(this.getAttribute("data-index"));
					document.querySelector('#panel-save input.code').value = storage[this.getAttribute("data-index")].name;
				};
				el.onclick = function(){
					elLoadCode.value = JSON.stringify(getFromStorage(this.getAttribute("data-index")));
				};
				el.children[0].onclick = function(_e){
					storage.splice(this.parentElement.getAttribute("data-index"), 1);
					saveStorage();
					buildLoad();

					_e.stopPropagation();
				};

			elTestsList.appendChild(el);
		}

		showPanel('load');
	}
	function buildExport(){

		var elExportCode = document.querySelector('#panel-export textarea.code');
		if (elExportCode) 
			elExportCode.value = JSON.stringify(getCurrentTestObject());

		showPanel('export');
	}
	function showPanel(_name){

		var elPanel = document.getElementById('panel-'+_name);
		if (elPanel) 
			elPanel.style.display = "block";

		return elPanel;
	}
	function hidePanels(){
		for(var ind = 0, els = document.querySelectorAll('.test-panel'), ln = els.length; ind < ln; ind++)
			els[ind].style.display = "none";
	}
	function runTests(){

		var casesList = [];

		var elsCases = document.querySelectorAll('.case');
		for(var ind = 0, ln = elsCases.length; ind < ln; ind++){
			if (elsCases[ind].querySelector(".title").value.length > 0  //  <-- 2
			&&  elsCases[ind].querySelector(".code").value.length > 0)
				casesList.push({
					name: elsCases[ind].querySelector(".title").value.replace(/(<([^>]+)>)/ig,""),
					code: encodeURIComponent( elsCases[ind].querySelector(".code").value )
				});
		}

		if (casesList.length < 2) return;

		var htmlData = `

			<script type="text/javascript" src="https://rawgit.com/lodash/lodash/4.12.0/dist/lodash.js"></script>
			<script type="text/javascript" src="https://rawgit.com/bestiejs/benchmark.js/2.1.0/benchmark.js"></script>
			
			<style>
				* {
				    box-sizing: border-box;
				}

				#test-output{
					max-width:  100vw;
					max-height: 80vh;
    				padding: 15px 0;
					overflow: auto;
				}
				#test-result{
					margin: 5px 0;    
					padding: 5px 0;
    				border-top: 1px solid #aaa;
				}
				#btn-runtest{
					display: none;
					width: 100%;
					padding: 5px 10px;
				}

				#jsp-head{
				    padding: 10px;
				    margin-bottom: 10px;
				    background: #f4f4f4;
				    box-shadow: 0 0 0 10px #f4f4f4, 0 0 0 11px #ddd;
				}

				#jsp-logo{
    				position: relative;
				    display: inline-block;
				    padding: 20px;
				    font-size: 50px;
				    font-family: Impact, Charcoal, sans-serif;
				    font-weight: 900;
				    background: #fb0;
				    color: #fff;
				    border-radius: 0px;
				    box-shadow: inset 0 0 0 5px #fff, 0 1px 2px rgba(0,0,0,0.4);
				    text-shadow: 0 1px 1px rgba(0,0,0,.2);
				}
				#jsp-logo::after{
					content: 'performance';
				    position: absolute;
				    left: calc( 100% + 20px );
				    color: #333;
				    text-shadow: none;
				    font-weight: normal;
				    font-style: oblique;
				}
				
				.center{
					max-width: 600px;
				    display: table;
				    width: 100%;
				    margin: auto;
				}

				.btn{
				    background: linear-gradient(180deg, #fff, #eee);
				    color: #333;
				    padding: 8px 14px;
				    border-radius: 1px;   
				    margin-right: -1px;
				    border: 0;
				    box-shadow: inset 0 0 0 1px rgba(0,0,0,.3);
				    outline: none !important;
				    cursor: pointer;
				    position: relative;
				}
				.btn:hover{
				    box-shadow: inset 0 0 0 1px rgba(0,0,0,.5), inset 0 0 0 100px rgba(255,255,255,.1);
				    z-index: 1;
				}
				
				.bar{
				    position: absolute;
				    top: 1px;
				    height: 24px;
				    opacity: 0.2;
				    left: 0;
				    background: #55d;
				    transition: .5s;
				    width: 0%;
  					pointer-events: none;
				}

				.case{
					_border-radius: 3px;
    				padding: 4px 10px;
    				position: relative;
					color: #333;
				}
				.case:hover{
					_box-shadow: inset 0 0 0 1px rgba(0,0,0,.2);
					color: #000;
				}
				.case[data-showcode="true"] pre{ display: block; }
				.case[data-slowest="true"]::after { background: #faa; box-shadow: 0 0 0 1px #fff; }
				.case[data-fastest="true"]::after { background: #afa; box-shadow: 0 0 0 1px #fff; }
				.case[data-error="true"] { color: #aaa; }
				.case[data-error="true"]::before {
				    content: '';
				    display: inline-block;
				    position: absolute;
				    width: 100%;
				    height: 2px;
				    background: #e55;
				    z-index: 100;
				    top: 50%;
				    left: 0;
				}
				.case[data-running="true"]{
					background: #55d;
				    background-size: 30px 30px;
				    background-image: linear-gradient(135deg, rgba(255, 255, 255, .15) 25%, transparent 25%,
				                      transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%,
				                      transparent 75%, transparent);            
				    
					box-shadow: inset 0 0 0 1px rgba(0,0,0,.15);
				    animation: animate-stripes 1s linear infinite;   
					color: #fff;
    				border-radius: 2px;
				}
				.case::after {
				    content: attr(data-count);
				    position: absolute;
					top: 4px;
				    right: 4px;
				    _background: #fff;
				    color: #333;
				    padding: 1px 6px 0;
				    margin-top: 1px;
				    font-family: monospace;
				    border-radius: 1px;
				}
				.case[data-error="true"]::after {
				    content: 'ERROR';
				    z-index: 100;
				    color: #e55;
				    font-weight: 900;
				    padding: 1px 2px;
				}
				.case .name:hover{
    				text-decoration: underline;
    				cursor: pointer;
				}
				.case pre{
					position: relative;
				    display: none;
				    width: 100%;
				    padding: 5px 10px;
				    margin: 5px 0;
    				border: 1px solid rgba(0,0,0,.2);
				    word-break: break-word;
				    word-wrap: break-word;
				    white-space: pre-wrap;
				}
				
				.message-error {
				    color: #e44;
				    text-align: center;
				    font-family: monospace;
				    transition: .2s;
				    animation: show-error 2s linear;   
				}

				[data-status="completed"] .case:hover .bar{ transition: .15s; opacity: .4; }

				@keyframes animate-stripes {
				    0%   {background-position: 0    0;} 
				    100% {background-position: 60px 0;}
				}
				@keyframes show-error {
			        0%   {opacity: 0;}
			        80%  {opacity: 0;}
			        100% {opacity: 1;}
				}
			</style>

			<div id="jsp-head"><div id="jsp-logo">JS</div></div>
			<div id="test-output">`+elTS_initialHtml.value+/* document.querySelector('#test-stuff .code').value+*/`</div>
			<div id="test-result">
				<div class="message-error">An error occurred while building the test.</div>
			</div>
			<div>
				<button class="btn" id="btn-runtest">RUN</button><br>
				<a href="javascript:void(0);" id="btn-toggleCodes">Show/hide codes</a>
			</div>
			

			<script type="text/javascript">
				
				var ___CTRL = (function(_Benchmark, _fnsetup, _fnteardown){

					var suite = new _Benchmark.Suite;
					var isRunning = false;
					var initialized = false;
					var minMax = [0,0];

					suite.on('complete', onComplete);
					
					function onComplete(){
						isRunning = false;
						console.log('Fastest:', suite.filter('fastest'));
						
						document.getElementById('btn-runtest').removeAttribute('disabled');
						document.body.setAttribute('data-status', 'completed');
						
						calcMinMax();
						
						var minTest = suite[minMax[0]];
						var maxTest = suite[minMax[1]];
						
						if (maxTest) maxTest.elResult.setAttribute('data-fastest', true);
						if (minTest) minTest.elResult.setAttribute('data-slowest', true);
						
						makeChart(true);
					}
					
					function calcMinMax(){
						if (suite.length < 1) return null; 
						
						var min = [Number.MAX_SAFE_INTEGER, -1];
						var max = [Number.MIN_SAFE_INTEGER, -1];
						
						for(var ind = 0, ln = suite.length; ind < ln; ind++){ 
							if(!suite[ind].error && max[0] < suite[ind].hz) {max[0] = suite[ind].hz; max[1] = ind;}
							if(!suite[ind].error && min[0] > suite[ind].hz) {min[0] = suite[ind].hz; min[1] = ind;}
						}
						
						minMax = [min[1], max[1]];
						return minMax;
					}

					function addCommas(_num) { 
						_num = (_num+'').split('.')[0];

						for(var ind = _num.length, counter = 0; ind > 0; ind--, counter++)
							if (counter && counter % 3 === 0)
								_num = [_num.slice(0, ind), ',', _num.slice(ind)].join('');

					    return _num;
					}

					function getMaxHZ(_arr){
						var picked = null;
						for(var ind = 0, ln = _arr.length, max = 0; ind < ln; ind++) 
							if(max < _arr[ind].hz) picked = ind;
						
						return _arr[picked];
					}

					function getMinHZ(_arr){
						var picked = null;
						for(var ind = 0, ln = _arr.length, min = 999999999999999; ind < ln; ind++) 
							if(min > _arr[ind].hz) picked = ind;
						
						return _arr[picked];
					}

					function buildResult(){

						var elResultContainer = document.getElementById('test-result');
							elResultContainer.innerHTML = '';
						for(var ind = 0, ln = suite.length; ind < ln; ind++){
							var elResult = document.createElement('div');
								elResult.className = 'case';
								elResult.setAttribute('title', decodeURIComponent( suite[ind].code ));
								elResult.innerHTML = '<span class="bar"></span><span class="name" data-index="'+ind+'">'+ suite[ind].name +'</span><pre>'+decodeURIComponent( suite[ind].code )+'</pre>';
								elResult.querySelector('span.name').onclick = function(){
									//suite[this.dataset.index].run({ async: true });
								};
							

							suite[ind].elResult = elResult;
							elResultContainer.appendChild(elResult);
						}
					}

					function updateTestStatus(_ev, _error){
						if (_ev.target.elResult){
							_ev.target.elResult.setAttribute("data-running", _ev.target.running);
							_ev.target.elResult.setAttribute("data-count",   _ev.target.hz == 0 ? '~' :addCommas(Math.round(_ev.target.hz)));
							if (_error) _ev.target.elResult.setAttribute("data-error",   !!_error);
						}
					}

					function run(){
						if (isRunning === false){
							isRunning = true;
							this.setAttribute('disabled', true);
							document.body.setAttribute('data-status', 'running');

							for(var ind = 0, els = document.querySelectorAll('#test-result .case'), ln = els.length; ind < ln; ind++){
								els[ind].removeAttribute("data-fastest");
								els[ind].removeAttribute("data-slowest");
								els[ind].removeAttribute("data-error");
								els[ind].querySelector('.bar').style.width = "0%";
							}

							setTimeout(function(){ suite.run({ async: true }); }, 500);
							
						}
					}

					function makeChart(_real){

						var min = 0;
						var max = 0;
						
						calcMinMax();
						
						var minTest = suite[minMax[0]];
						var maxTest = suite[minMax[1]];
						
						if (maxTest) max = maxTest.hz;
						if (minTest) min = minTest.hz;
						if (_real)   min = 0;
						
						max -= min;

						for(var ind = 0, ln = suite.length; ind < ln; ind++)
							suite[ind].elResult.querySelector('.bar').style.width = ((suite[ind].hz - min) * 100 /max)+"%";				
					}
					
					function toggleCodeVisibility(){
						if (isRunning) return;
						toggleCodeVisibility.state = !toggleCodeVisibility.state;
					
						for(var ind = 0, els = document.querySelectorAll('#test-result .case'), ln = els.length; ind < ln; ind++)
							els[ind].setAttribute("data-showcode", toggleCodeVisibility.state);
						
					}

					return {
						addCase: function(_name, _fn, _fnc){
							suite.add(_name, _fn, { 
								onStart:    function(_ev){ updateTestStatus(_ev); },
								onComplete: function(_ev){ updateTestStatus(_ev); },
								onError: 	function(_ev){ updateTestStatus(_ev, true); },
								setup: 		_fnsetup,
								teardown: 	_fnteardown,
								code: 		_fnc
							});
						},
						init: function(){
							if (initialized) return;
								initialized = true;
							
							buildResult();
							document.getElementById('btn-runtest').style.display = "block";
							document.getElementById('btn-runtest').onclick = run;
							document.getElementById('btn-toggleCodes').onclick = toggleCodeVisibility;
							
							window.addEventListener("click", function(_e){
						
								if (isRunning === false
								&&  _e.target.className === 'name' 
								&&  _e.target.parentElement.className === 'case' ){ 
									_e.target.parentElement.setAttribute( 
										'data-showcode',
										_e.target.parentElement.getAttribute('data-showcode') === 'true' ? 'false' : 'true'
									);
								}
							});
						},
						makeChart: function(_real){ makeChart(_real); },
						get tests(){ return suite; }
					};

				}(Benchmark, function(_ev){ `+elTS_preCase.value +` }, function(_ev){ `+elTS_postCase.value+` }));

				`+
				(function(){
					var currentCase = '';
					for(var ind = 0, ln = casesList.length; ind < ln; ind++){
						currentCase += `
							___CTRL.addCase(
							    '`+ casesList[ind].name.replace(/\\/g, '\\\\').replace(/\'/g, '\\\'')+`', 
							    function() { `+ decodeURIComponent(casesList[ind].code)+` }, 
								"`+casesList[ind].code+`"
							);
						`;
					}
					return currentCase;
				}())
				+`

				___CTRL.init();

			</script>
		`;


		if (lastUrl) URL.revokeObjectURL(lastUrl);
		var blob = new Blob([htmlData], {type: 'text/html'});
		lastUrl = URL.createObjectURL(blob);

		window.open(lastUrl, '_blank');
		console.info('Test page running on:', lastUrl);
	}
	function parents(_el, _fn){
		while (_el) if (_fn(_el)) return _el;
					else _el = _el.parentElement;
	}