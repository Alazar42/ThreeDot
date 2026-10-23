import React from 'react';
import type { ClassDoc } from '../types';
import { CodeBlock } from './CodeBlock';

interface ClassDocViewProps {
  doc: ClassDoc;
  onNavigateClass: (name: string) => void;
}

export const ClassDocView: React.FC<ClassDocViewProps> = ({ doc, onNavigateClass }) => {

  return (
    <article className="class-doc-article">
      {/* Breadcrumb Navigation */}
      <nav className="doc-breadcrumbs">
        <span className="crumb-root">ThreeDot</span>
        <span className="crumb-sep">/</span>
        <span className="crumb-cat">{doc.category}</span>
        <span className="crumb-sep">/</span>
        <span className="crumb-active">{doc.name}</span>
      </nav>

      {/* Class Title Header */}
      <header className="class-header">
        <div className="class-title-row">
          <h1 className="class-title">{doc.name}</h1>
          <span className="class-badge-cat">{doc.category}</span>
        </div>

        {/* Inheritance Line */}
        <div className="inheritance-box">
          {doc.inherits && (
            <div className="inherits-row">
              <span className="inherits-label">Inherits:</span>
              <button
                type="button"
                className="link-chip"
                onClick={() => onNavigateClass(doc.inherits!)}
              >
                {doc.inherits}
              </button>
            </div>
          )}

          {doc.inheritedBy && doc.inheritedBy.length > 0 && (
            <div className="inherits-row">
              <span className="inherits-label">Inherited by:</span>
              <div className="inherited-by-chips">
                {doc.inheritedBy.map((subClass) => (
                  <button
                    key={subClass}
                    type="button"
                    className="link-chip"
                    onClick={() => onNavigateClass(subClass)}
                  >
                    {subClass}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Brief Description */}
      <section className="doc-brief-card">
        <p className="brief-text">{doc.brief}</p>
      </section>

      {/* Detailed Description */}
      <section className="doc-section">
        <h2 className="section-heading">Detailed Description</h2>
        <div className="description-body">
          {doc.description.split('\n\n').map((para, i) => (
            <p key={`para-${i}`} className="doc-paragraph">
              {para}
            </p>
          ))}
        </div>
      </section>

      {/* Code Example */}
      {doc.codeExample && (
        <section className="doc-section">
          <CodeBlock
            code={doc.codeExample}
            language="typescript"
            title={`${doc.name} Example`}
          />
        </section>
      )}

      {/* Properties Summary */}
      {doc.properties.length > 0 && (
        <section className="doc-section">
          <h2 className="section-heading">Properties Summary</h2>
          <div className="table-responsive">
            <table className="doc-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Name</th>
                  <th>Default</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {doc.properties.map((prop) => (
                  <tr key={prop.name}>
                    <td className="cell-type">{prop.type}</td>
                    <td className="cell-name">
                      <a href={`#prop-${prop.name}`}>{prop.name}</a>
                    </td>
                    <td className="cell-default">{prop.defaultValue ?? '-'}</td>
                    <td className="cell-desc">{prop.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Methods Summary */}
      {doc.methods.length > 0 && (
        <section className="doc-section">
          <h2 className="section-heading">Methods Summary</h2>
          <div className="table-responsive">
            <table className="doc-table">
              <thead>
                <tr>
                  <th>Return</th>
                  <th>Method</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {doc.methods.map((method) => (
                  <tr key={method.name}>
                    <td className="cell-type">{method.returns}</td>
                    <td className="cell-name">
                      <a href={`#method-${method.name}`}>
                        {method.name}(
                        {method.params.map((p, idx) => (
                          <span key={p.name}>
                            {idx > 0 && ', '}
                            <span className="param-name">{p.name}</span>: {p.type}
                          </span>
                        ))}
                        )
                      </a>
                    </td>
                    <td className="cell-desc">{method.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Signals Summary */}
      {doc.signals.length > 0 && (
        <section className="doc-section">
          <h2 className="section-heading">Signals</h2>
          <div className="table-responsive">
            <table className="doc-table">
              <thead>
                <tr>
                  <th>Signal</th>
                  <th>Arguments</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {doc.signals.map((sig) => (
                  <tr key={sig.name}>
                    <td className="cell-name font-mono">{sig.name}</td>
                    <td className="cell-type">
                      {sig.args.length === 0 ? (
                        'None'
                      ) : (
                        sig.args.map((a, i) => (
                          <span key={a.name}>
                            {i > 0 && ', '}
                            {a.name}: {a.type}
                          </span>
                        ))
                      )}
                    </td>
                    <td className="cell-desc">{sig.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Constants & Enums */}
      {doc.constants && doc.constants.length > 0 && (
        <section className="doc-section">
          <h2 className="section-heading">Constants & Enumerations</h2>
          <div className="table-responsive">
            <table className="doc-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Value</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {doc.constants.map((c) => (
                  <tr key={c.name}>
                    <td className="cell-name font-mono">{c.name}</td>
                    <td className="cell-default">{c.value}</td>
                    <td className="cell-desc">{c.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Detailed Properties Descriptions */}
      {doc.properties.length > 0 && (
        <section className="doc-section">
          <h2 className="section-heading">Property Descriptions</h2>
          <div className="detailed-list">
            {doc.properties.map((prop) => (
              <div key={prop.name} id={`prop-${prop.name}`} className="detailed-item">
                <div className="item-header">
                  <span className="item-type">{prop.type}</span>
                  <span className="item-name">{prop.name}</span>
                  {prop.defaultValue && (
                    <span className="item-default-badge">
                      [default: {prop.defaultValue}]
                    </span>
                  )}
                </div>
                <p className="item-desc">{prop.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Detailed Methods Descriptions */}
      {doc.methods.length > 0 && (
        <section className="doc-section">
          <h2 className="section-heading">Method Descriptions</h2>
          <div className="detailed-list">
            {doc.methods.map((method) => (
              <div key={method.name} id={`method-${method.name}`} className="detailed-item">
                <div className="item-header">
                  <span className="item-type">{method.returns}</span>
                  <span className="item-name">{method.name}</span>
                  <span className="item-params">
                    (
                    {method.params.map((p, idx) => (
                      <span key={p.name}>
                        {idx > 0 && ', '}
                        {p.name}: {p.type}
                        {p.defaultValue && ` = ${p.defaultValue}`}
                      </span>
                    ))}
                    )
                  </span>
                </div>
                <p className="item-desc">{method.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
};
