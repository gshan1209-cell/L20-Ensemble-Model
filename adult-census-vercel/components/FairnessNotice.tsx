export default function FairnessNotice() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
      <strong className="block mb-1">Fairness Notice</strong>
      This model is for educational and portfolio purposes only. It should NOT be used for
      real-world salary, hiring, lending, insurance, or any high-stakes decisions. The dataset
      contains demographic features (race, sex, native-country) that may reflect historical biases.
      Predictions do not represent individual merit or potential.
    </div>
  );
}
