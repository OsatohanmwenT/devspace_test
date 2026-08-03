export function DevyChatRail({ messages, question, options, selectedOption, onSelectOption, onCollapse }) {
  return (
    <div className="lesson-chat-rail">
      <div className="lesson-chat-rail-messages">
        {messages.map((message) => (
          <div key={message.id} className={message.active ? 'lesson-chat-bubble is-active' : 'lesson-chat-bubble'}>
            <p>{message.text}</p>
          </div>
        ))}

        {question && (
          <section className="lesson-chat-prompt" aria-label="Devy question">
            <p>{question}</p>
            <div className="lesson-chat-options">
              {options.map((option, index) => (
                <button
                  key={option}
                  type="button"
                  className={selectedOption === index ? 'lesson-chat-option is-selected' : 'lesson-chat-option'}
                  onClick={() => onSelectOption(index)}
                >
                  {option}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="lesson-chat-composer">
        <button type="button" className="lesson-devy-avatar" onClick={onCollapse} aria-label="Collapse Devy chat">
          <img src="/assets/devy.svg" alt="" />
        </button>
        <form className="lesson-chat-input" onSubmit={(event) => event.preventDefault()}>
          <input type="text" placeholder="How can I help?" aria-label="How can I help?" />
          <button type="button" className="lesson-chat-mic" aria-label="Use microphone">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" />
              <path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}

