import React from "react";
import "./style.css";
import Button from "../ui/Button";

function Header({ name, onSave }) {
  return (
    <div className="header-container">
      <div />
      <h3 className="header-title">Demo editor by {name}</h3>
      <Button onClick={onSave}>Save</Button>
    </div>
  );
}

export default Header;
