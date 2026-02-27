document.addEventListener("DOMContentLoaded", () => {
    // Number animation function
    const animateValue = (obj, start, end, duration) => {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);

            // Ease out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentVal = Math.floor(easeOut * (end - start) + start);

            obj.innerHTML = currentVal.toLocaleString();

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.innerHTML = end.toLocaleString();
            }
        };
        window.requestAnimationFrame(step);
    };

    const triggerAnimations = () => {
        const highlightElements = document.querySelectorAll('.highlight-val');
        highlightElements.forEach(el => {
            const valueStr = el.textContent.trim().replace(/,/g, '');
            const num = parseInt(valueStr, 10);
            if (!isNaN(num) && num > 0) {
                animateValue(el, 0, num, 1000 + Math.random() * 500);
            }
        });
    };

    // Data fetching and UI update logic
    const dateSelect = document.getElementById('date-select');
    const currentDataFileText = document.getElementById('current-data-file');
    const statusBadge = document.getElementById('status-badge');
    const statusText = document.getElementById('status-text');

    const updateTableCells = (rowLabelText, dataArray, contextSelector = '') => {
        // find td with exact text
        const labels = document.querySelectorAll(`${contextSelector} td.row-label`);
        let targetCell = null;
        for (let label of labels) {
            if (label.textContent.trim() === rowLabelText) {
                targetCell = label;
                break;
            }
        }
        if (targetCell && dataArray) {
            let nextTd = targetCell.nextElementSibling;
            for (let i = 0; i < 4; i++) {
                if (nextTd) {
                    // add commas
                    nextTd.textContent = dataArray[i].toLocaleString();
                    nextTd = nextTd.nextElementSibling;
                }
            }
        }
    };

    const loadData = async (dateStr) => {
        const fileName = `data_${dateStr}.json`;
        currentDataFileText.textContent = `${fileName} 불러오는 중...`;

        try {
            // Add cache busting for local dev if needed, or just fetch directly
            const response = await fetch(fileName);
            if (!response.ok) {
                throw new Error('데이터 파일을 찾을 수 없습니다.');
            }
            const data = await response.json();

            currentDataFileText.textContent = `${fileName} 데이터 로드 완료`;

            // Update Status Badge
            if (data.status === 'LIVE') {
                statusBadge.classList.remove('offline');
                statusBadge.style.background = 'rgba(16, 185, 129, 0.1)';
                statusBadge.style.color = '#059669';
                statusBadge.style.borderColor = 'rgba(16, 185, 129, 0.2)';
                statusBadge.querySelector('.pulse').style.background = '#059669';
                statusBadge.querySelector('.pulse').style.boxShadow = '0 0 0 0 rgba(16, 185, 129, 0.7)';
                statusBadge.querySelector('.pulse').style.animation = 'pulse-green 2s infinite';

                // create dynamic style for pulse-green if not exist
                if (!document.getElementById('dynamic-pulse-style')) {
                    const style = document.createElement('style');
                    style.id = 'dynamic-pulse-style';
                    style.innerHTML = `
                        @keyframes pulse-green {
                            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
                            70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
                            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                        }
                    `;
                    document.head.appendChild(style);
                }
            } else {
                statusBadge.classList.add('offline');
                statusBadge.style.background = '';
                statusBadge.style.color = '';
                statusBadge.style.borderColor = '';
                statusBadge.querySelector('.pulse').style.background = '';
                statusBadge.querySelector('.pulse').style.boxShadow = '';
                statusBadge.querySelector('.pulse').style.animation = '';
            }
            statusText.textContent = data.status;

            // Update Tables
            // 가입과 로그인
            updateTableCells('가입', data.signup_login.signup);
            updateTableCells('로그인', data.signup_login.login);

            // AI 콘텐츠 생성
            updateTableCells('이용자수(명)', data.content_gen.users);
            updateTableCells('생성건수(건)', data.content_gen.generations);

            const errorBox = document.querySelector('.alert-box.warning span');
            if (errorBox) {
                if (data.content_gen.error_msg) {
                    errorBox.parentElement.style.display = 'flex';
                    errorBox.textContent = data.content_gen.error_msg;
                } else {
                    errorBox.parentElement.style.display = 'none';
                }
            }

            // 작업 별 생성건수
            updateTableCells('T2I', data.task_gen['T2I']);
            updateTableCells('I2I', data.task_gen['I2I']);
            updateTableCells('Styling Booth', data.task_gen['Styling Booth']);
            updateTableCells('BG Changer', data.task_gen['BG Changer']);
            updateTableCells('Face swap', data.task_gen['Face swap']);
            updateTableCells('Video', data.task_gen['Video']);

            // 단건구매
            updateTableCells('375 Credit', data.credit['375']);
            updateTableCells('750 Credit', data.credit['750']);
            updateTableCells('1250 Credit', data.credit['1250']);

            // 구독가입 (first sub-card)
            updateTableCells('Basic', data.sub_join.Basic, '.sub-card:nth-of-type(1)');
            updateTableCells('Pro', data.sub_join.Pro, '.sub-card:nth-of-type(1)');

            // 구독 취소 (second sub-card)
            updateTableCells('Basic', data.sub_cancel.Basic, '.sub-card:nth-of-type(2)');
            updateTableCells('Pro', data.sub_cancel.Pro, '.sub-card:nth-of-type(2)');

            // Trigger animations
            triggerAnimations();

        } catch (error) {
            console.error(error);
            currentDataFileText.textContent = `데이터 로드 실패: ${dateStr}`;
            alert(`${dateStr} 일자의 데이터 파일이 존재하지 않습니다.`);
        }
    };

    if (dateSelect) {
        // 오늘 날짜 기준으로 어제 날짜 계산
        const today = new Date();
        today.setDate(today.getDate() - 1);
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const yesterdayStr = `${yyyy}-${mm}-${dd}`;

        // date input의 기본값과 최대 선택 가능 날짜를 어제로 설정
        dateSelect.max = yesterdayStr;
        dateSelect.value = yesterdayStr;

        dateSelect.addEventListener('change', (e) => {
            loadData(e.target.value);
        });

        // Initial load
        loadData(dateSelect.value);
    }
});
