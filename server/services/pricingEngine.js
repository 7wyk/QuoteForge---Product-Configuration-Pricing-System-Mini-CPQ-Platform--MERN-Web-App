/**
 * Rule-based Pricing Engine
 *
 * Evaluates a list of PricingRule documents against a configuration map.
 * Returns total added price and a breakdown of applied rules.
 *
 * @param {object} config  - key/value map of selected config options, e.g. { voltage: "220", material: "copper" }
 * @param {Array}  rules   - array of PricingRule Mongoose documents
 * @returns {{ totalAdded: number, appliedRules: Array }}
 */
const evaluateRules = (config, rules) => {
  const appliedRules = [];
  let totalAdded = 0;

  const activeRules = rules
    .filter((r) => r.isActive)
    .sort((a, b) => b.priority - a.priority);

  for (const rule of activeRules) {
    const { field, operator, value } = rule.condition;
    const configValue = config[field];

    if (configValue === undefined || configValue === null) continue;

    const numericConfig = parseFloat(configValue);
    const numericRule = parseFloat(value);

    let conditionMet = false;

    switch (operator) {
      case '>':
        conditionMet = !isNaN(numericConfig) && !isNaN(numericRule) && numericConfig > numericRule;
        break;
      case '<':
        conditionMet = !isNaN(numericConfig) && !isNaN(numericRule) && numericConfig < numericRule;
        break;
      case '>=':
        conditionMet = !isNaN(numericConfig) && !isNaN(numericRule) && numericConfig >= numericRule;
        break;
      case '<=':
        conditionMet = !isNaN(numericConfig) && !isNaN(numericRule) && numericConfig <= numericRule;
        break;
      case '==':
        conditionMet = String(configValue).toLowerCase() === String(value).toLowerCase();
        break;
      case '!=':
        conditionMet = String(configValue).toLowerCase() !== String(value).toLowerCase();
        break;
      case 'includes':
        conditionMet = String(configValue).toLowerCase().includes(String(value).toLowerCase());
        break;
      default:
        break;
    }

    if (conditionMet) {
      totalAdded += rule.addedPrice;
      appliedRules.push({
        name: rule.name,
        description: rule.description || `${field} ${operator} ${value}`,
        addedPrice: rule.addedPrice,
      });
    }
  }

  return { totalAdded, appliedRules };
};

module.exports = { evaluateRules };
