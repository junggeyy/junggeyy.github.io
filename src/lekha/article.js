(function () {
    const energy = document.getElementById('energy');
    const households = document.getElementById('households');
    const factor = document.getElementById('factor');
    const days = document.getElementById('days');

    if (!energy || !households || !factor || !days) return;

    const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
    const precise = new Intl.NumberFormat('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

    function formatEmissions(kilograms) {
        if (kilograms >= 1_000) return `${number.format(kilograms / 1_000)} t CO₂`;
        return `${number.format(kilograms)} kg CO₂`;
    }

    function logarithmicWidth(value, maximum) {
        return Math.max(2, (Math.log10(value + 1) / Math.log10(maximum + 1)) * 100);
    }

    function updateVisualization() {
        const energyValue = Number(energy.value);
        const householdValue = Number(households.value);
        const factorValue = Number(factor.value);
        const daysValue = Number(days.value);
        const homePerDay = energyValue * factorValue;
        const communityPerDay = homePerDay * householdValue;
        const totals = {
            home: homePerDay,
            day: communityPerDay,
            summer: communityPerDay * daysValue,
        };

        document.getElementById('energy-output').value = `${precise.format(energyValue)} kWh`;
        document.getElementById('households-output').value = number.format(householdValue);
        document.getElementById('factor-output').value = `${precise.format(factorValue)} kg/kWh`;
        document.getElementById('days-output').value = number.format(daysValue);

        Object.entries(totals).forEach(([key, value]) => {
            document.querySelector(`[data-bar="${key}"]`).style.width = `${logarithmicWidth(value, totals.summer)}%`;
            document.querySelector(`[data-value="${key}"]`).textContent = formatEmissions(value);
        });
    }

    [energy, households, factor, days].forEach((control) => {
        control.addEventListener('input', updateVisualization);
    });

    updateVisualization();
})();
