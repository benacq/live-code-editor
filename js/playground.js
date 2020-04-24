window.onload = () => {
    
    function resizer() {
        $('#output-header').mousedown((e) => e.stopPropagation())
        let iframeWrapperResize = document.getElementById('resizeableY');
        let mouseStart, startOffsetY, startHeight;
        let iframe = document.getElementById('browser-output').contentWindow;

        function setDefaultHeight() {
            let pageHeader = $('.editor-header').outerHeight(true);
            let envFlexBox = $('.code-editor').outerHeight(true);
            let iframeWrapperOffset = (document.documentElement.scrollHeight - (pageHeader + envFlexBox) + $('#output-header').outerHeight() + 13);
            if (iframeWrapperOffset <= 0) {
                $('#resizeableY').css('top', `${0}px`);
            } else {
                $('#resizeableY').css('top', `${iframeWrapperOffset}px`);
            }
            return iframeWrapperOffset;
        }
        setDefaultHeight();

        function initResize(e) {
            e.preventDefault();
            mouseStart = e.clientY;
            startHeight = parseInt(document.defaultView.getComputedStyle(iframeWrapperResize).height, 10);
            startOffsetY = iframeWrapperResize.getBoundingClientRect().top;
            document.addEventListener('mousemove', startResize, false);
            iframe.addEventListener('mousemove', endResize)
            document.addEventListener('mouseup', endResize, false);
        }

        function startResize(e) {
            iframeWrapperResize.style.borderTop = '15px solid red';
            document.documentElement.style.cursor = "row-resize";
            iframeWrapperResize.style.height = `${startHeight - (e.clientY - mouseStart) }px`;
            iframeWrapperResize.style.top = `${startOffsetY + (e.clientY - mouseStart)}px`;
            let iframeWrapperTop = `${startOffsetY + (e.clientY - mouseStart)}`;
            $('.code-editor').css('height', `${iframeWrapperTop -  $('.editor-header').outerHeight(true)}px`);
            if (iframeWrapperTop > document.documentElement.scrollHeight - 20) {
                $('#resizeableY').css('top', `${document.documentElement.scrollHeight - 20}px`);
                endResize();
            } else if (iframeWrapperTop <= 0) {
                $('#resizeableY').css('top', `${0}px`);
                endResize();
            }
        }

        function endResize() {
            document.documentElement.style.cursor = "default";
            iframeWrapperResize.style.borderTop = '15px solid #222';
            document.removeEventListener('mousemove', startResize)
            document.removeEventListener('mouseup', endResize)
        }

        return function () {
            iframeWrapperResize.addEventListener('mousedown', initResize, false);
        }
    }

    let resize = resizer();
    resize();



    function switchTabs() {
        let tabBtn = document.getElementsByClassName('editor-tab');
        let language = document.getElementsByClassName('language');
        for (let i = 0; i < tabBtn.length; i++) {
            const currentTab = tabBtn[i];
            const currentLanguage = language[i];
            currentTab.addEventListener('click', function removeTab() {
                let active = document.getElementsByClassName('activated');
                if (currentLanguage.classList.contains('activated') && active.length > 1) {
                    currentLanguage.classList.remove('activated');
                    currentTab.style.backgroundColor = '#222';
                    currentLanguage.classList.add('deactivated');
                    switch (active.length) {
                        case 1:
                            $('.language').css('width', '100%');
                            console.log('second tab disabled')
                            active[0].style.border = 'none';
                            break;
                        case 2:
                            $('.language').css('width', '50%');
                            if (currentLanguage.classList.contains('css') && active[i].classList.contains('js')) {
                                active[i].style.borderLeft = 'none';
                            }
                            console.log('first tab disabled')
                            break;
                        default:
                            $('.language').css('width', '33.333333%');
                            break;
                    }
                } else {
                    currentLanguage.classList.add('activated');
                    currentLanguage.classList.remove('deactivated');
                    currentTab.style.backgroundColor = 'rgb(88, 88, 88)';
                    switch (active.length) { //WORK ON EDITOR BORDERS
                        case 2:
                            console.log('second tab activated');
                            break;
                        case 3:
                            console.log('third tab activated');
                            break;
                    }
                }
            });
        }
    }
    switchTabs();

    let htmlEditor = document.getElementById('html-editor');
    let cssEditor = document.getElementById('css-editor');
    let jsEditor = document.getElementById('js-editor');

    function initAce(env) {
        let editor = ace.edit(env, {
            theme: "ace/theme/monokai",
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            enableSnippets: true,
            enableEmmet: true,
        });

        return editor;
    }

    function editorSetup(lang, env) {
        let editor = initAce(env);
        let EditSession = require("ace/edit_session").EditSession;
        let js = new EditSession("");
        let css = new EditSession([]);
        let html;
        editor.session.setUseWrapMode(true);
        new ResizeSensor($('.language'), function () {
            editor.resize() 
        });

        switch (editor.id) {
            case 'editor2':
                editor.setSession(css);
                break;
            case 'editor3':
                editor.setSession(js);
                break;
            default:
                html = editor.session.getValue();
                break;
        }
        editor.getSession().setMode(`ace/mode/${lang}`);
        editor.getSession().on('change', () => {
            let html = ace.edit(htmlEditor).getValue();
            let cssCode = ace.edit(cssEditor).getValue();
            let jsCode = ace.edit(jsEditor).getValue();
            switch (editor.id) {
                case 'editor1':
                    browserOutput(html, cssCode, jsCode);
                    break;
                case 'editor2':
                    cssCode = editor.session.getValue();
                    browserOutput(html, cssCode, jsCode);
                    break;
                case 'editor3':
                    jsCode = editor.session.getValue();
                    browserOutput(html, cssCode, jsCode);
                    break;
            }
        })

    }
    editorSetup('html', htmlEditor);
    editorSetup('css', cssEditor);
    editorSetup('javascript', jsEditor);

    function browserOutput(html, css, js) {
        let iframe = document.getElementById('browser-output').contentWindow;
        iframe.document.open();
        iframe.document.write(`<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <style type="text/css">${css}</style>
    </head>
    <body>
        ${html}
    </body>
        </html>`);
        iframe.document.close();
        try {
            iframe.eval(js);
        } catch (e) {
            return (`${e}`);
        }

    }



    /*
    THEME : DROPDOWN SELECT
    LANGUAGE : ['WEB DEV','JAVA','C/C++','C#']
    FONT-SIZE : DROPDOWN SELECT
    LINE WRAP : ON/OFF

    MAKING CSS WORK: GET THE VALUE IN THE CSS ENV SESSION AND INSERT IT IN A STYLE TAG IN HTML
    */



}