const Result = ({ result, confidence }) => {
  return result < 0 ? null : (
    <div className="result">
      <h2>Result: {result}</h2>
      <h4>Confidence: {confidence}</h4>
    </div>
  );
};

export default Result;
