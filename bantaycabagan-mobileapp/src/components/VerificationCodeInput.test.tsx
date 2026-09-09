import React, { useState } from 'react';
import { Keyboard, TextInput } from 'react-native';
import { act, cleanup, fireEvent, render } from '@testing-library/react-native';
import VerificationCodeInput from './VerificationCodeInput';

// Model TextInputState's Android behavior: focus() is a no-op if JS already
// considers the input focused, even when the native keyboard has disappeared.
// This tests the recovery commands, not an actual Android IME.
let nativeFocused: boolean;
let keyboardVisible: boolean;
let focus: jest.SpyInstance;
let blur: jest.SpyInstance;
let setNativeProps: jest.SpyInstance;

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  nativeFocused = true;
  keyboardVisible = false;
  focus = jest.spyOn(TextInput.prototype, 'focus').mockImplementation(() => {
    if (nativeFocused) return;
    nativeFocused = true;
    keyboardVisible = true;
  });
  blur = jest.spyOn(TextInput.prototype, 'blur').mockImplementation(() => {
    nativeFocused = false;
    keyboardVisible = false;
  });
  setNativeProps = jest.spyOn(TextInput.prototype, 'setNativeProps');
  jest.spyOn(Keyboard, 'isVisible').mockImplementation(() => keyboardVisible);
});

afterEach(async () => {
  await cleanup();
  jest.restoreAllMocks();
  jest.useRealTimers();
});

async function flushFocus() {
  await act(() => jest.advanceTimersByTime(32));
}

it('reopens a dismissed keyboard on repeated box taps despite stale native focus', async () => {
  const view = await render(<VerificationCodeInput value="" onChangeText={jest.fn()} />);
  for (const digit of [1, 6, 3]) {
    keyboardVisible = false; // Android Back hides the IME without a blur event.
    await fireEvent.press(view.getByLabelText(`Verification code digit ${digit}`));
    await flushFocus();
    expect(keyboardVisible).toBe(true);
    expect(nativeFocused).toBe(true);
    expect(setNativeProps).toHaveBeenLastCalledWith({ selection: { start: 0, end: 0 } });
  }
  expect(blur).toHaveBeenCalledTimes(3);
});

it('resets the cleared code cursor and recovers focus after each rejected attempt', async () => {
  const onChangeText = jest.fn();
  const view = await render(<VerificationCodeInput value="123456" onChangeText={onChangeText} />);
  for (const focusRequest of [1, 2, 3]) {
    await view.rerender(<VerificationCodeInput value="123456" onChangeText={onChangeText} disabled />);
    await fireEvent(view.getByLabelText('Six-digit verification code'), 'selectionChange', {
      nativeEvent: { selection: { start: 6, end: 6 } },
    });
    keyboardVisible = false;
    await view.rerender(<VerificationCodeInput value="" onChangeText={onChangeText} focusRequest={focusRequest} invalid />);
    expect(view.getByLabelText('Six-digit verification code')).toHaveProp('selection', { start: 0, end: 0 });
    await flushFocus();
    expect(keyboardVisible).toBe(true);
    await fireEvent.changeText(view.getByLabelText('Six-digit verification code'), '9');
    expect(onChangeText).toHaveBeenLastCalledWith('9');
  }
});

it('keeps the keyboard open when selecting and replacing an existing digit', async () => {
  keyboardVisible = true;
  function Field() {
    const [value, setValue] = useState('123456');
    return <VerificationCodeInput value={value} onChangeText={setValue} />;
  }
  const view = await render(<Field />);
  await fireEvent.press(view.getByLabelText('Verification code digit 3'));
  await flushFocus();
  expect(blur).not.toHaveBeenCalled();
  expect(setNativeProps).toHaveBeenLastCalledWith({ selection: { start: 2, end: 3 } });
  await fireEvent.changeText(view.getByLabelText('Six-digit verification code'), '129456');
  expect(view.getByLabelText('Six-digit verification code')).toHaveProp('value', '129456');
});

it('does not steal focus again on countdown or error rerenders', async () => {
  const onChangeText = jest.fn();
  const view = await render(<VerificationCodeInput value="" onChangeText={onChangeText} focusRequest={1} />);
  await flushFocus();
  focus.mockClear();
  keyboardVisible = false;
  await view.rerender(<VerificationCodeInput value="" onChangeText={onChangeText} focusRequest={1} invalid />);
  await flushFocus();
  expect(focus).not.toHaveBeenCalled();
  expect(keyboardVisible).toBe(false);
});

it('defers error recovery while pending and retries a canceled focus request', async () => {
  const onChangeText = jest.fn();
  const view = await render(<VerificationCodeInput value="" onChangeText={onChangeText} focusRequest={1} />);
  await view.rerender(<VerificationCodeInput value="" onChangeText={onChangeText} focusRequest={1} disabled />);
  await fireEvent.press(view.getByLabelText('Verification code digit 1'));
  await fireEvent.changeText(view.getByLabelText('Six-digit verification code'), '123456');
  await flushFocus();
  expect(focus).not.toHaveBeenCalled();
  expect(onChangeText).not.toHaveBeenCalled();
  await view.rerender(<VerificationCodeInput value="" onChangeText={onChangeText} focusRequest={1} />);
  await flushFocus();
  expect(keyboardVisible).toBe(true);
});

it('cancels scheduled box focus when leaving the screen', async () => {
  const view = await render(<VerificationCodeInput value="" onChangeText={jest.fn()} />);
  await fireEvent.press(view.getByLabelText('Verification code digit 1'));
  await view.unmount();
  await flushFocus();
  expect(focus).not.toHaveBeenCalled();
  expect(setNativeProps).not.toHaveBeenCalled();
});
