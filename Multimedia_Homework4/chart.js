window.onload = function () {
    const canvas = document.getElementById("chartCanvas");
    const ctx = canvas.getContext("2d");

    const width = canvas.width;
    const height = canvas.height;

    const xStep = 20;           // Distance between points on X
    const yGridStep = 100;      // Grid spacing on Y
    const xGridStep = 150;      // Grid spacing on X (vertical lines)
    const leftPadding = 40;
    const bottomPadding = 30;
    const textOffset = 5;

    const pointCount = Math.floor((width - leftPadding) / xStep);

    let series = [
        { name: "Series A", color: "#4caf50", data: [] },
        { name: "Series B", color: "#f44336", data: [] },
        { name: "Series C", color: "#2196f3", data: [] }
    ];

     let minValue = 0;
    let maxValue = height;
    let showGrid = true;
    let smoothLines = false;
    let chartType = "line";
    let theme = "light";

    let timer = null;
    let intervalMs = 1000;

    const startBtn = document.getElementById("startBtn");
    const pauseBtn = document.getElementById("pauseBtn");
    const resetBtn = document.getElementById("resetBtn");
    const exportBtn = document.getElementById("exportBtn");

    const speedSlider = document.getElementById("speedSlider");
    const speedValue = document.getElementById("speedValue");
    const minValueInput = document.getElementById("minValueInput");
    const maxValueInput = document.getElementById("maxValueInput");
    const gridToggle = document.getElementById("gridToggle");
    const smoothToggle = document.getElementById("smoothToggle");
    const chartTypeSelect = document.getElementById("chartTypeSelect");
    const themeSelect = document.getElementById("themeSelect");

    const tooltip = document.getElementById("tooltip");

    const statCurrent = document.getElementById("statCurrent");
    const statMin = document.getElementById("statMin");
    const statMax = document.getElementById("statMax");
    const statAvg = document.getElementById("statAvg");
    const statTrend = document.getElementById("statTrend");

    
    initData();
    draw();
    setupControls();
    startTimer();

    function initData() {
        series.forEach((s, idx) => {
            s.data = [];
            for (let i = 0; i < pointCount; i++) {
                s.data.push(generateValueForSeries(idx));
            }
        });
        updateStats();
    }

    function generateValueForSeries(seriesIndex) {
        const min = minValue;
        const max = maxValue;
       const base = min + Math.random() * (max - min);

        if (seriesIndex === 1) {
           return min + (Math.sin(Date.now() / 1000 + Math.random()) + 1) / 2 * (max - min);
        }
        if (seriesIndex === 2) {
            return min + Math.pow(Math.random(), 0.3) * (max - min);
        }
        return base;
    }

    function generateNewValues() {
        series.forEach((s, idx) => {
            const newVal = generateValueForSeries(idx);
            s.data.push(newVal);
            if (s.data.length > pointCount) {
                s.data.shift();
            }
        });
        updateStats();
    }



    function draw() {
        ctx.clearRect(0, 0, width, height);

        if (showGrid) {
            drawGrid();
        }

        drawAxes();
        drawChart();
    }

    function drawGrid() {
        ctx.save();
        ctx.strokeStyle = getThemeColors().grid;
        ctx.lineWidth = 1;

        for (let y = 0; y <= height - bottomPadding; y += yGridStep) {
            ctx.beginPath();
            ctx.moveTo(leftPadding, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

       
        for (let x = leftPadding; x <= width; x += xGridStep) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height - bottomPadding);
            ctx.stroke();
        }

        ctx.restore();
    }

    function drawAxes() {
        ctx.save();
        ctx.strokeStyle = getThemeColors().axis;
        ctx.fillStyle = getThemeColors().axis;
        ctx.lineWidth = 2;

      
        ctx.beginPath();
        ctx.moveTo(leftPadding, 0);
        ctx.lineTo(leftPadding, height - bottomPadding);
        ctx.stroke();

       
        ctx.beginPath();
        ctx.moveTo(leftPadding, height - bottomPadding);
        ctx.lineTo(width, height - bottomPadding);
        ctx.stroke();

   
        ctx.font = "12px Arial";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";

        const steps = (height - bottomPadding) / yGridStep;
        for (let i = 0; i <= steps; i++) {
            const y = i * yGridStep;
            const value = maxValue - ((maxValue - minValue) / steps) * i;
            ctx.fillText(value.toFixed(0), leftPadding - textOffset, y);
        }

        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        const xLabelsCount = Math.floor((width - leftPadding) / xGridStep);
        for (let i = 0; i <= xLabelsCount; i++) {
            const x = leftPadding + i * xGridStep;
            ctx.fillText(i * xGridStep, x, height - bottomPadding + textOffset);
        }

        ctx.restore();
    }

    function drawChart() {
        if (chartType === "line" || chartType === "area" || chartType === "scatter") {
            series.forEach((s, idx) => {
                ctx.save();
                ctx.strokeStyle = s.color;
                ctx.fillStyle = s.color;

                if (chartType === "line") {
                    if (smoothLines) {
                        drawSmoothLine(s.data);
                    } else {
                        drawSharpLine(s.data);
                    }
                } else if (chartType === "area") {
                    drawArea(s.data, s.color);
                } else if (chartType === "scatter") {
                    drawScatter(s.data);
                }

                ctx.restore();
            });
        } else if (chartType === "bar") {
            drawBars();
        }
    }

    function valueToY(value) {
        const ratio = (value - minValue) / (maxValue - minValue || 1);
        return (height - bottomPadding) - ratio * (height - bottomPadding - 10);
    }

    function indexToX(index) {
        return leftPadding + index * xStep;
    }

    function drawSharpLine(data) {
        if (data.length === 0) return;
        ctx.beginPath();
        ctx.lineWidth = 2;

        ctx.moveTo(indexToX(0), valueToY(data[0]));
        for (let i = 1; i < data.length; i++) {
            ctx.lineTo(indexToX(i), valueToY(data[i]));
        }
        ctx.stroke();
    }

    function drawSmoothLine(data) {
        if (data.length < 2) return;
        ctx.beginPath();
        ctx.lineWidth = 2;

        ctx.moveTo(indexToX(0), valueToY(data[0]));
        for (let i = 1; i < data.length - 1; i++) {
            const xMid = (indexToX(i) + indexToX(i + 1)) / 2;
            const yMid = (valueToY(data[i]) + valueToY(data[i + 1])) / 2;
            ctx.quadraticCurveTo(indexToX(i), valueToY(data[i]), xMid, yMid);
        }
        ctx.quadraticCurveTo(
            indexToX(data.length - 1),
            valueToY(data[data.length - 1]),
            indexToX(data.length - 1),
            valueToY(data[data.length - 1])
        );
        ctx.stroke();
    }

    function drawArea(data, color) {
        if (data.length === 0) return;
        ctx.beginPath();
        ctx.moveTo(indexToX(0), height - bottomPadding);
        for (let i = 0; i < data.length; i++) {
            ctx.lineTo(indexToX(i), valueToY(data[i]));
        }
        ctx.lineTo(indexToX(data.length - 1), height - bottomPadding);
        ctx.closePath();
        ctx.fillStyle = hexToRgba(color, 0.3);
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    function drawScatter(data) {
        ctx.lineWidth = 1;
        data.forEach((v, i) => {
            const x = indexToX(i);
            const y = valueToY(v);
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    function drawBars() {
        if (series.length === 0) return;
        const seriesCount = series.length;
        const barGroupWidth = xStep * 0.8;
        const barWidth = barGroupWidth / seriesCount;

        series.forEach((s, sIndex) => {
            ctx.fillStyle = s.color;
            for (let i = 0; i < s.data.length; i++) {
                const value = s.data[i];
                const xBase = indexToX(i) - barGroupWidth / 2;
                const x = xBase + sIndex * barWidth;
                const y = valueToY(value);
                const h = (height - bottomPadding) - y;
                ctx.fillRect(x, y, barWidth, h);
            }
        });
    }


    function updateStats() {
        const data = series[0].data;
        if (!data || data.length === 0) {
            statCurrent.textContent = "-";
            statMin.textContent = "-";
            statMax.textContent = "-";
            statAvg.textContent = "-";
            statTrend.textContent = "-";
            return;
        }

        const current = data[data.length - 1];
        const min = Math.min(...data);
        const max = Math.max(...data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        const trend =
            data.length >= 2
                ? current > data[data.length - 2]
                    ? "Rising"
                    : current < data[data.length - 2]
                        ? "Falling"
                        : "Stable"
                : "-";

        statCurrent.textContent = current.toFixed(1);
        statMin.textContent = min.toFixed(1);
        statMax.textContent = max.toFixed(1);
        statAvg.textContent = avg.toFixed(1);
        statTrend.textContent = trend;
    }


    function startTimer() {
        if (timer) return;
        timer = setInterval(() => {
            generateNewValues();
            draw();
        }, intervalMs);
    }

    function stopTimer() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    }

    function restartTimer() {
        stopTimer();
        startTimer();
    }


    function setupControls() {
        startBtn.addEventListener("click", () => {
            startTimer();
        });

        pauseBtn.addEventListener("click", () => {
            stopTimer();
        });

        resetBtn.addEventListener("click", () => {
            initData();
            draw();
        });

        speedSlider.addEventListener("input", () => {
            intervalMs = Number(speedSlider.value);
            speedValue.textContent = intervalMs;
            restartTimer();
        });

        minValueInput.addEventListener("change", () => {
            minValue = Number(minValueInput.value);
            initData();
            draw();
        });

        maxValueInput.addEventListener("change", () => {
            maxValue = Number(maxValueInput.value);
            initData();
            draw();
        });

        gridToggle.addEventListener("change", () => {
            showGrid = gridToggle.checked;
            draw();
        });

        smoothToggle.addEventListener("change", () => {
            smoothLines = smoothToggle.checked;
            draw();
        });

        chartTypeSelect.addEventListener("change", () => {
            chartType = chartTypeSelect.value;
            draw();
        });

        themeSelect.addEventListener("change", () => {
            theme = themeSelect.value;
            applyTheme();
            draw();
        });

        exportBtn.addEventListener("click", () => {
            const link = document.createElement("a");
            link.download = "chart.png";
            link.href = canvas.toDataURL("image/png");
            link.click();
        });

        canvas.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("mouseleave", () => {
            tooltip.style.display = "none";
        });
    }

    

    function handleMouseMove(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (x < leftPadding || x > width || y < 0 || y > height - bottomPadding) {
            tooltip.style.display = "none";
            return;
        }

        const index = Math.round((x - leftPadding) / xStep);
        if (index < 0 || index >= series[0].data.length) {
            tooltip.style.display = "none";
            return;
        }

        const values = series.map(s => s.data[index].toFixed(1));
        const valueStrings = series.map((s, i) => `<span style="color:${s.color}">${s.name}: ${values[i]}</span>`);

        tooltip.innerHTML = `x: ${index}<br>${valueStrings.join("<br>")}`;
        tooltip.style.left = e.clientX + "px";
        tooltip.style.top = e.clientY + "px";
        tooltip.style.display = "block";
    }

    

    function getThemeColors() {
        if (theme === "dark") {
            return {
                grid: "#555",
                axis: "#eee"
            };
        } else if (theme === "contrast") {
            return {
                grid: "#ff0",
                axis: "#ff0"
            };
        } else {
            return {
                grid: "#ccc",
                axis: "#000"
            };
        }
    }

    function applyTheme() {
        document.body.classList.remove("theme-light", "theme-dark", "theme-contrast");
        if (theme === "dark") document.body.classList.add("theme-dark");
        else if (theme === "contrast") document.body.classList.add("theme-contrast");
        else document.body.classList.add("theme-light");
    }



    function hexToRgba(hex, alpha) {
        let c = hex.replace("#", "");
        if (c.length === 3) {
            c = c.split("").map(ch => ch + ch).join("");
        }
        const num = parseInt(c, 16);
        const r = (num >> 16) & 255;
        const g = (num >> 8) & 255;
        const b = num & 255;
        return `rgba(${r},${g},${b},${alpha})`;
    }
};
