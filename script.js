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

    // Find all cells that have numbers to animate
    // We only animate the highlight values for the '1일', '1주' etc, but specifically let's target .highlight-val and .task-val
    const highlightElements = document.querySelectorAll('.highlight-val, .task-val, .task-count');
    
    // Create an intersection observer to trigger animations when scrolled into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const valueStr = el.textContent.trim().replace(/,/g, '');
                
                // Only animate if it's a valid integer greater than 0
                const num = parseInt(valueStr, 10);
                if (!isNaN(num) && num > 0 && !el.dataset.animated) {
                    el.dataset.animated = "true";
                    animateValue(el, 0, num, 1500 + Math.random() * 500); // 1.5s to 2s
                }
                
                // Stop observing once animated
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.1 });

    highlightElements.forEach(el => observer.observe(el));

    // Progress bar animations
    const progressBars = document.querySelectorAll('.progress-bar .fill');
    const bgObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const targetWidth = bar.style.width;
                
                bar.style.width = '0%';
                
                // Animate to target width
                setTimeout(() => {
                    bar.style.transition = 'width 1.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
                    bar.style.width = targetWidth;
                }, 100);
                
                bgObserver.unobserve(bar);
            }
        });
    }, { threshold: 0.1 });

    progressBars.forEach(bar => bgObserver.observe(bar));

    // Simple interaction for the control buttons to feel alive
    const uploadBtn = document.querySelector('.upload-btn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => {
            uploadBtn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                uploadBtn.style.transform = 'scale(1)';
            }, 100);
            
            // Add a temporary glow effect
            const originalShadow = uploadBtn.style.boxShadow;
            uploadBtn.style.boxShadow = '0 0 20px #7c3aed, 0 0 40px #ec4899';
            
            setTimeout(() => {
                uploadBtn.style.boxShadow = originalShadow;
                alert('파일 선택 시스템과 연동할 수 있습니다.');
            }, 600);
        });
    }

    const datePicker = document.querySelector('.date-picker');
    if (datePicker) {
        datePicker.addEventListener('click', () => {
            alert('날짜 선택 캘린더가 열립니다.');
        });
    }
});
