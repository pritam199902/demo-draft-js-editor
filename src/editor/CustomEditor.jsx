import "draft-js/dist/Draft.css";
import React, { useState, useRef, useEffect } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  Modifier,
  convertToRaw,
  convertFromRaw,
} from "draft-js";
import Header from "./Header";
import useLocalStore from "./useLocalStore";

const DATA_KEY = "editor-data-key";

const styleMap = {
  "red-line": {
    color: "red",
  },
};

const Mode = {
  BLOCK: "BLOCK",
  INLINE_STYLE: "INLINE_STYLE",
  REMOVE_STYLE: "REMOVE_STYLE",
};

const CaseMapper = {
  "#": {
    changeType: "change-block-type",
    type: "header-one",
    mode: Mode.BLOCK,
    focusOffset: 1,
  },
  "*": {
    changeType: "change-inline-style",
    type: "BOLD",
    mode: Mode.INLINE_STYLE,
    focusOffset: 1,
  },
  "**": {
    changeType: "change-inline-style",
    type: "red-line",
    mode: Mode.INLINE_STYLE,
    focusOffset: 2,
  },
  "***": {
    changeType: "change-inline-style",
    type: "UNDERLINE",
    mode: Mode.INLINE_STYLE,
    focusOffset: 3,
  },
  "```": {
    changeType: "change-block-type",
    type: "code-block",
    mode: Mode.BLOCK,
    focusOffset: 3,
  },

  [Mode.REMOVE_STYLE]: {
    changeType: "change-block-type",
    type: "unstyled",
    mode: Mode.REMOVE_STYLE,
    focusOffset: 3,
  },
};

const CustomEditor = ({ name = "<Name>" }) => {
  const editorRef = useRef(null);
  const { get, set } = useLocalStore();

  const [editorState, setEditorState] = useState(() => {
    const savedData = get(DATA_KEY);
    return savedData
      ? EditorState.createWithContent(convertFromRaw(JSON.parse(savedData)))
      : EditorState.createEmpty();
  });

  function handleResetStyling() {
    const selection = editorState.getSelection();
    const startKey = selection.getStartKey();
    const startOffset = selection.getStartOffset();

    updateEditor({ startKey, startOffset, ...CaseMapper[Mode.REMOVE_STYLE] });
  }

  function isResetStyleRequired() {
    const selection = editorState.getSelection();
    const startKey = selection.getStartKey();
    const startOffset = selection.getStartOffset();
    const block = editorState.getCurrentContent().getBlockForKey(startKey);
    const blockText = block.getText();
    const blockType = block.getType();
    const currentStyle = editorState.getCurrentInlineStyle().toArray();

    if (blockText == "" && startOffset === 0) {
      if (blockType !== "unstyled" || currentStyle?.length !== 0) {
        return true;
      }
    }
    return false;
  }

  const handleKeyCommand = (command, editorState) => {
    if (command === "backspace") {
      if (isResetStyleRequired()) {
        handleResetStyling();
        return "handled";
      }
    }

    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  };

  function updateEditor({ startKey, changeType, type, mode, focusOffset = 0 }) {
    if (!changeType || !type || !mode) return false;
    const selection = editorState.getSelection().merge({
      anchorKey: startKey,
      focusKey: startKey,
      anchorOffset: 0,
      focusOffset: focusOffset,
    });

    if (mode === Mode.REMOVE_STYLE) {
      let tempEditorState = editorState;
      tempEditorState = RichUtils.toggleBlockType(tempEditorState, type);
      const currentStyle = tempEditorState.getCurrentInlineStyle().toArray();
      for (const style of currentStyle) {
        tempEditorState = RichUtils.toggleInlineStyle(tempEditorState, style);
      }
      tempEditorState = EditorState.push(
        tempEditorState,
        tempEditorState.getCurrentContent(),
        "change-block-type"
      );
      tempEditorState = EditorState.push(
        tempEditorState,
        tempEditorState.getCurrentContent(),
        "change-inline-style"
      );
      setEditorState(tempEditorState);
      return true;
    }

    let newContentState = Modifier.setBlockType(
      editorState.getCurrentContent(),
      selection,
      type
    );

    let newEditorState = EditorState.push(
      editorState,
      newContentState,
      changeType
    );

    if (mode === Mode.BLOCK) {
      // newContentState = Modifier.removeRange(
      //   newContentState,
      //   selection,
      //   "backward"
      // );
      // newEditorState = EditorState.push(
      //   editorState,
      //   newContentState,
      //   changeType
      // );
      setEditorState(newEditorState);
    } else if (mode === Mode.INLINE_STYLE) {
      newEditorState = EditorState.push(
        editorState,
        newContentState,
        changeType
      );
      newEditorState = RichUtils.toggleInlineStyle(newEditorState, type);
      setEditorState(newEditorState);
    }
    return true;
  }

  const handleBeforeInput = (chars, editorState) => {
    const selection = editorState.getSelection();
    const startKey = selection.getStartKey();
    const startOffset = selection.getStartOffset();
    const block = editorState.getCurrentContent().getBlockForKey(startKey);
    const blockText = block.getText();

    if (
      (startOffset === 1 || startOffset === 2 || startOffset === 3) &&
      chars === " "
    ) {
      const ok = updateEditor({
        startOffset,
        startKey,
        ...CaseMapper[blockText],
      });
      if (ok) {
        return "handled";
      }
    }
    return "not-handled";
  };

  const saveContent = () => {
    const content = editorState.getCurrentContent();
    set(DATA_KEY, JSON.stringify(convertToRaw(content)));
  };

  useEffect(() => {
    editorRef?.current?.focus?.();
  }, []);

  return (
    <div>
      <Header name={name} onSave={saveContent} />
      <div className="editor-container">
        <Editor
          ref={editorRef}
          editorState={editorState}
          handleKeyCommand={handleKeyCommand}
          onChange={setEditorState}
          handleBeforeInput={handleBeforeInput}
          customStyleMap={styleMap}
        />
      </div>
    </div>
  );
};

export default CustomEditor;
