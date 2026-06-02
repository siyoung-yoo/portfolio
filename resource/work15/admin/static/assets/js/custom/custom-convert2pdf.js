/**
 * html2canvas.min.js
 * jspdf.js 
 * 
 * 위 두개 파일 필요
 * 
 * 2025.03.27 작성
 * */


/**
 * 'printing' 클래스로 출력제외 항목 제어
 * */
function printCss(type) {
    let className = 'printing';
    if (type === 'on') {
        document.body.classList.add(className);
    } else if (type === 'off') {
        document.body.classList.remove(className);
    }
}

/**
 * @param target 대상 element
 * @param title 파일명
 * @param options 옵션항목
 *
 * <pre>
 *     options : {
 *          uploadUrl: (string) 서버전송 url,
 *          param: (object) 서버전송 추가 param ex) {paramName1: paramValue1, paramName2: paramValue2},
 *          localSave: (boolean) 로컬저장
 *     }
 * </pre>
 * */
function convert2Pdf(target, title, options) {
    printCss('on');
    title = title + '.pdf';
    const { jsPDF } = window.jspdf;
    window.scrollTo(0,0); // 스크롤 맨위로 이동

    // pdf 변환 옵션
    let canvasOpt = {
        scale:3,
        scrollX : window.scrollX,
        scrollY : window.scrollY,
        windowWidth : target.scrollWidth,
        windowHeight : target.scrollHeight,
        backgroundColor: '#fff'
    }
    // pdf 이미지 생성
    html2canvas(target, canvasOpt).then((canvas) => {
        // 캔버스를 이미지로 변환
        const imgData = canvas.toDataURL('image/jpeg');

        const imgWidth = 210;
        const pageHeight = imgWidth * 1.414;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        const doc = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });

        let heightLeft = imgHeight;
        let position = 0;

        // 첫 페이지 출력
        doc.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // 한 페이지 이상일 경우 루프 돌면서 출력
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            doc.addPage();
            doc.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        const uploadUrl = options['uploadUrl'];
        if (!!uploadUrl && typeof uploadUrl === 'string') {
            const blob = doc.output('blob');
            const formData = new FormData();
            formData.append('file', new Blob([blob],{ type: 'application/pdf'}), title);

            if (!!options['param']) {
                const param = options['param'];
                Object.keys(param).forEach(key => {
                    formData.append(key, param[key]);
                });
            }

            $.ajax({
                url: options['uploadUrl'],
                type:'post',
                data: formData,
                processData: false,
                contentType: false,
                error: function(err) {
                    console.log(err)
                }
            });
        }

        if (options['localSave']) {
            doc.save(title);
        }
    })
    printCss('off');
}