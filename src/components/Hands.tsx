import { hands } from "../assets/hands";
import "../styles/Hands.css";

type HandsProps = {
  left: number; // values from 0 to 5
  right: number; // values from 0 to 5
  leftActive?: boolean;
  rightActive?: boolean;
  onLeftClick?: () => void;
  onRightClick?: () => void;
  multiplication: boolean[];
};

function Hands({
  left,
  right,
  leftActive = false,
  rightActive = false,
  onLeftClick,
  onRightClick,
  multiplication = [false, false],
}: HandsProps) {
  return (
    <div className="d-flex justify-content-center align-items-center gap-5 flex-wrap mt-4">
      {/* Left hand */}
      <div className="hand-container">
        <img
          src={hands[left]}
          alt={`Left hand with ${left} fingers`}
          className={leftActive ? "left-hand-active" : "left-hand"}
          onClick={onLeftClick}
          style={{ width: "16vw" }}
        />
        {multiplication[0] && (
          <div
            className="multiply-wristband"
            style={{ transform: "translateX(-57%)" }}
          />
        )}
      </div>
      {/* Right hand */}
      <div className="hand-container">
        <img
          src={hands[right]}
          alt={`Right hand with ${right} fingers`}
          className={rightActive ? "right-hand-active" : "right-hand"}
          onClick={onRightClick}
          style={{ width: "16vw" }}
        />
        {multiplication[1] && (
          <div
            className="multiply-wristband"
            style={{ transform: "translateX(-43%)" }}
          />
        )}
      </div>
    </div>
  );
}

export default Hands;
