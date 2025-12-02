import { useState } from 'react';

function QuickTools() {
  // Calculator state
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcOperation, setCalcOperation] = useState(null);
  const [calcFirstNum, setCalcFirstNum] = useState(null);

  // Unit Converter state
  const [convertValue, setConvertValue] = useState('');
  const [convertType, setConvertType] = useState('ETBtoUSD');
  const [convertResult, setConvertResult] = useState('');

  // Weather Widget state
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);

  // Random Picker state
  const [options, setOptions] = useState('');
  const [pickedOption, setPickedOption] = useState('');

  // Mock weather data
  const mockWeatherData = {
    'addis ababa': { temperature: '24°C', condition: 'Sunny' },
    'new york': { temperature: '15°C', condition: 'Cloudy' },
    'london': { temperature: '12°C', condition: 'Rainy' },
  };

  // Mock conversion rates (updated ETB to USD)
  const conversionRates = {
    ETBtoUSD: 0.007142857, // 1 ETB = 1/140 USD (1 USD = 140 ETB)
    kmToMiles: 0.621371, // 1 km = 0.621371 miles
  };

  // Calculator functions
  const handleCalcInput = (value) => {
    if (calcDisplay === '0' && value !== '.') {
      setCalcDisplay(value); // Replace 0 with new number
    } else if (value === '.' && calcDisplay.includes('.')) {
      return; // Prevent multiple decimals
    } else {
      setCalcDisplay(calcDisplay + value); // Append to current display
    }
  };

  const handleCalcOperation = (operation) => {
    if (calcFirstNum !== null && calcOperation) {
      handleCalcResult(); // Chain calculation if there's a pending operation
      setCalcOperation(operation); // Set new operation for next input
    } else {
      setCalcFirstNum(parseFloat(calcDisplay)); // Store first number
      setCalcOperation(operation); // Set operation
      setCalcDisplay('0'); // Reset display for second number
    }
  };

  const handleCalcResult = () => {
    if (calcFirstNum === null || !calcOperation) return; // No operation pending
    const secondNum = parseFloat(calcDisplay);
    let result;
    switch (calcOperation) {
      case '+':
        result = calcFirstNum + secondNum;
        break;
      case '-':
        result = calcFirstNum - secondNum;
        break;
      case '×':
        result = calcFirstNum * secondNum;
        break;
      case '÷':
        result = secondNum === 0 ? 'Error' : calcFirstNum / secondNum;
        break;
      default:
        return;
    }
    setCalcDisplay(result === 'Error' ? 'Error' : result.toString());
    setCalcFirstNum(result === 'Error' ? null : result); // Allow chaining if not error
    setCalcOperation(null); // Reset operation
  };

  const handleCalcClear = () => {
    setCalcDisplay('0');
    setCalcFirstNum(null);
    setCalcOperation(null);
  };

  // Unit Converter functions
  const handleConvert = () => {
    const value = parseFloat(convertValue);
    if (isNaN(value) || convertValue === '') {
      setConvertResult('');
      return;
    }
    let result;
    switch (convertType) {
      case 'ETBtoUSD':
        result = (value * conversionRates.ETBtoUSD).toFixed(2);
        setConvertResult(`${result} USD`);
        break;
      case 'kmToMiles':
        result = (value * conversionRates.kmToMiles).toFixed(2);
        setConvertResult(`${result} miles`);
        break;
      default:
        setConvertResult('');
    }
  };

  // Weather Widget functions
  const handleFetchWeather = () => {
    if (!city.trim()) {
      setWeather({ temperature: 'N/A', condition: 'Enter a city' });
      return;
    }
    const cityKey = city.trim().toLowerCase();
    const cityData = mockWeatherData[cityKey];
    if (cityData) {
      setWeather(cityData);
    } else {
      setWeather({ temperature: 'N/A', condition: 'City not found' });
    }
  };

  // Random Picker functions
  const handlePick = () => {
    const optionsArray = options
      .split(',')
      .map((option) => option.trim())
      .filter((option) => option);
    if (optionsArray.length === 0) {
      setPickedOption('No options provided');
      return;
    }
    const randomIndex = Math.floor(Math.random() * optionsArray.length);
    setPickedOption(optionsArray[randomIndex]);
  };

  return (
    <div className="text-text-primary">
      <h2 className="text-2xl font-bold mb-6 text-text-primary">Quick Tools Suite</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calculator */}
        <div className="bg-card-bg border border-card-border p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4 text-text-primary">Calculator</h3>
          <div className="mb-4">
            <input
              type="text"
              value={calcDisplay}
              readOnly
              className="w-full p-2 rounded-lg bg-input-bg text-input-text border border-input-border text-right text-lg"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {['7', '8', '9', '÷'].map((btn) => (
              <button
                key={btn}
                onClick={() =>
                  /[0-9.]/.test(btn) ? handleCalcInput(btn) : handleCalcOperation(btn)
                }
                className="p-3 bg-surface-elevated text-text-primary rounded-lg hover:bg-surface-hover transition-colors"
              >
                {btn}
              </button>
            ))}
            {['4', '5', '6', '×'].map((btn) => (
              <button
                key={btn}
                onClick={() =>
                  /[0-9.]/.test(btn) ? handleCalcInput(btn) : handleCalcOperation(btn)
                }
                className="p-3 bg-surface-elevated text-text-primary rounded-lg hover:bg-surface-hover transition-colors"
              >
                {btn}
              </button>
            ))}
            {['1', '2', '3', '-'].map((btn) => (
              <button
                key={btn}
                onClick={() =>
                  /[0-9.]/.test(btn) ? handleCalcInput(btn) : handleCalcOperation(btn)
                }
                className="p-3 bg-surface-elevated text-text-primary rounded-lg hover:bg-surface-hover transition-colors"
              >
                {btn}
              </button>
            ))}
            {['0', '.', '=', '+'].map((btn) => (
              <button
                key={btn}
                onClick={() =>
                  btn === '='
                    ? handleCalcResult()
                    : /[0-9.]/.test(btn)
                    ? handleCalcInput(btn)
                    : handleCalcOperation(btn)
                }
                className="p-3 bg-surface-elevated text-text-primary rounded-lg hover:bg-surface-hover transition-colors"
              >
                {btn}
              </button>
            ))}
            <button
              onClick={handleCalcClear}
              className="col-span-4 p-3 bg-error text-error-text rounded-lg hover:bg-error-hover transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Unit Converter */}
        <div className="bg-card-bg border border-card-border p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4 text-text-primary">Unit Converter</h3>
          <div className="mb-4">
            <label htmlFor="convert-type" className="block text-sm text-text-muted mb-2">
              Conversion Type
            </label>
            <select
              id="convert-type"
              value={convertType}
              onChange={(e) => {
                setConvertType(e.target.value);
                handleConvert();
              }}
              className="w-full p-2 rounded-lg bg-input-bg text-input-text border border-input-border focus:outline-none focus:border-input-border-focus focus:ring-2 focus:ring-primary/10"
            >
              <option value="ETBtoUSD">ETB to USD</option>
              <option value="kmToMiles">km to miles</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="convert-value" className="block text-sm text-text-muted mb-2">
              Value
            </label>
            <input
              type="number"
              id="convert-value"
              value={convertValue}
              onChange={(e) => {
                setConvertValue(e.target.value);
                handleConvert();
              }}
              className="w-full p-2 rounded-lg bg-input-bg text-input-text border border-input-border focus:outline-none focus:border-input-border-focus focus:ring-2 focus:ring-primary/10 placeholder:text-input-placeholder"
              placeholder="Enter value"
            />
          </div>
          <div className="p-3 bg-surface-elevated border border-border rounded-lg">
            <p className="text-text-muted">Result: <span className="text-text-primary font-semibold">{convertResult || '0'}</span></p>
          </div>
        </div>

        {/* Weather Widget */}
        <div className="bg-card-bg border border-card-border p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4 text-text-primary">Weather Widget</h3>
          <div className="mb-4">
            <label htmlFor="city" className="block text-sm text-text-muted mb-2">
              City
            </label>
            <input
              type="text"
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleFetchWeather()}
              className="w-full p-2 rounded-lg bg-input-bg text-input-text border border-input-border focus:outline-none focus:border-input-border-focus focus:ring-2 focus:ring-primary/10 placeholder:text-input-placeholder"
              placeholder="e.g., Addis Ababa"
            />
          </div>
          <button
            onClick={handleFetchWeather}
            className="w-full bg-primary text-primary-text py-2 rounded-lg hover:bg-primary-hover transition-colors mb-4"
          >
            Get Weather
          </button>
          {weather && (
            <div className="p-3 bg-surface-elevated border border-border rounded-lg">
              <p className="text-text-muted">Temperature: <span className="text-text-primary font-semibold">{weather.temperature}</span></p>
              <p className="text-text-muted">Condition: <span className="text-text-primary font-semibold">{weather.condition}</span></p>
            </div>
          )}
        </div>

        {/* Random Picker */}
        <div className="bg-card-bg border border-card-border p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4 text-text-primary">Random Picker</h3>
          <div className="mb-4">
            <label htmlFor="options" className="block text-sm text-text-muted mb-2">
              Options (comma-separated)
            </label>
            <input
              type="text"
              id="options"
              value={options}
              onChange={(e) => setOptions(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handlePick()}
              className="w-full p-2 rounded-lg bg-input-bg text-input-text border border-input-border focus:outline-none focus:border-input-border-focus focus:ring-2 focus:ring-primary/10 placeholder:text-input-placeholder"
              placeholder="e.g., Injera, Pasta"
            />
          </div>
          <button
            onClick={handlePick}
            className="w-full bg-primary text-primary-text py-2 rounded-lg hover:bg-primary-hover transition-colors mb-4"
          >
            Pick
          </button>
          {pickedOption && (
            <div className="p-3 bg-surface-elevated border border-border rounded-lg">
              <p className="text-text-muted">Picked: <span className="text-text-primary font-semibold">{pickedOption}</span></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuickTools;