import type GPTAnswer from '@typing/gpt-answer';
import type Config from '@typing/config';
import handleClipboard from '@core/questions/clipboard';
import handleContentEditable from '@core/questions/contenteditable';
import handleNumber from '@core/questions/number';
import handleRadio from '@core/questions/radio';
import handleCheckbox from '@core/questions/checkbox';
import handleSelect from '@core/questions/select';
import handleTextbox from '@core/questions/textbox';
import handleAtto from '@core/questions/atto';

type Props = {
  config: Config;
  questionElement: HTMLElement;
  inputList: NodeListOf<HTMLElement>;
  gptAnswer: GPTAnswer;
  removeListener: () => void;
};

/**
 * Autocomplete mode:
 * Autocomplete the question by checking the good answer
 * @param props
 * @returns
 */
function autoCompleteMode(props: Props) {
  if (!props.config.infinite) props.removeListener();

  const handlers = [
    handleAtto,
    handleContentEditable,
    handleTextbox,
    handleNumber,
    handleSelect,
    handleRadio,
    handleCheckbox
  ];

  for (const handler of handlers) {
    if (handler(props.config, props.inputList, props.gptAnswer)) return;
  }

  // In the case we can't auto complete the question
  handleClipboard(props.config, props.gptAnswer);
}

export default autoCompleteMode;
