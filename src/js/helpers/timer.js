async function timer(time = 0) {
  await new Promise((resolve) => { setTimeout(resolve, time); });
}

export default timer;
