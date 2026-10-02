import { useState } from 'react';
import './cardConcept.css';

const cards = [
  {
    label: 'LEARNING PATH',
    title: 'Thinking in Code',
    detail: '8 of 12 lessons complete',
    tags: ['IN PROGRESS', 'BEGINNER'],
    footer: 'PICK UP WHERE YOU LEFT OFF',
    color: 'peach',
  },
  {
    label: 'NEXT CHAPTER',
    title: 'Python Foundations',
    detail: 'Your next chapter starts here',
    tags: ['6 MODULES', 'PRACTICE'],
    footer: 'READY WHEN YOU ARE',
    color: 'butter',
  },
  {
    label: 'LEADERBOARD',
    title: 'Code League',
    detail: '#12 this season · 1,280 XP',
    tags: ['TOP 15', '5 DAYS LEFT'],
    footer: 'SEASON ENDS SOON',
    color: 'lilac',
  },
  {
    label: 'YOUR WORK',
    title: 'Portfolio',
    detail: '3 projects ready to show',
    tags: ['PROJECTS', 'SHAREABLE'],
    footer: 'UPDATED TODAY',
    color: 'blue',
  },
  {
    label: 'DAILY MOMENTUM',
    title: '7-day streak',
    detail: 'One more day, one step further',
    tags: ['DAILY GOAL', '+35 XP'],
    footer: 'KEEP IT GOING',
    color: 'coral',
  },
  {
    label: 'CREATE',
    title: 'Build with AI',
    detail: 'Make something worth sharing',
    tags: ['PROJECT', 'INTERMEDIATE'],
    footer: 'EXPLORE NEXT',
    color: 'mint',
  },
];

export default function CardConceptPreview() {
  const [selected, setSelected] = useState(null);

  return (
    <main className="card-concept">
      <div className="card-concept__intro">
        <span className="card-concept__eyebrow">DEVSPACE / CARD STUDY 01</span>
        <h1>What could your next step look like?</h1>
        <p>Select a card to bring it into focus.</p>
      </div>

      <div className="card-concept__stage" aria-label="Devspace card concepts">
        {cards.map((card, index) => (
          <button
            className="card-concept__card"
            data-color={card.color}
            data-selected={selected === index}
            key={card.title}
            type="button"
            aria-pressed={selected === index}
            onClick={() => setSelected(index)}
            onFocus={() => setSelected(index)}
          >
            <span className="card-concept__face">
              <span className="card-concept__brand">
                <span className="card-concept__mark" aria-hidden="true"><i /><i /><i /><i /></span>
                <span>devspace</span>
              </span>
              <span className="card-concept__label">{card.label}</span>
              <strong className="card-concept__title">{card.title}</strong>
              <span className="card-concept__detail">{card.detail}</span>
              <span className="card-concept__tags">
                {card.tags.map((tag) => <span className="card-concept__tag" key={tag}>{tag}</span>)}
              </span>
            </span>
            <span className="card-concept__footer">{card.footer}</span>
          </button>
        ))}
      </div>
    </main>
  );
}
