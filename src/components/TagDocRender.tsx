import React from 'react';
import { TagDoc } from './TagDoc.interface';
import { decideClassName } from '../pages/extended-code-mirror';
import { TagAttribute } from './TagAttribute.interface';
import { AttributeType } from './AttributeType.class';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Tooltip } from 'react-tooltip';
import { faLock } from '@fortawesome/free-solid-svg-icons'
import { faLockOpen, faList, faCircleDot } from '@fortawesome/free-solid-svg-icons'
import useBaseUrl from '@docusaurus/useBaseUrl';
import { injectTokenStyle } from '../pages/extended-code-mirror';
import useIsBrowser from '@docusaurus/useIsBrowser';

// What a mess... I hate React. Gets the job done though.

export const TypeRender: React.FC<{ type: AttributeType }> = ({ type }) => {
  return (
    <a href={useBaseUrl(type.relativeDocsUrl)} className="unstyled-anchor">
      <span style={{
        backgroundColor: type.color,
        color: 'black',
        padding: '0 .1rem',
        borderRadius: '.2rem',
        cursor: 'pointer',
      }}>{type.name}</span>
   </a>
  );
};

const AttributeLineRender: React.FC<{ tag: TagDoc, attribute: TagAttribute }> = ({ tag, attribute }) => {
  const cName = decideClassName('MARKUP__IDENTIFIER__ATTRIBUTE_USER');
  const cPunct = decideClassName('EXPRESSION__PUNCTUATION__ANY');

  return (
    <div>
      <Tooltip id="attribute-tooltip" />
      <p style={{margin: 0}}>
        &nbsp;&nbsp;<span style={{marginRight: '.4rem'}}>
          <span
            data-tooltip-id="attribute-tooltip"
            data-tooltip-content={attribute.fallback !== null ? 'Optional attribute' : 'Mandatory attribute'}
            style={{color: attribute.fallback !== null ? '#87E56B' : '#FFA3A5'}}
          >
            <FontAwesomeIcon icon={attribute.fallback !== null ? faLockOpen : faLock} />
          </span>
          <span
            data-tooltip-id="attribute-tooltip"
            data-tooltip-content={attribute.multiValue ? 'May be specified multiple times' : 'May only be specified once'}
            style={{color: '#F8F856'}}
          >
            <FontAwesomeIcon size='xs' icon={attribute.multiValue ? faList : faCircleDot} />
          </span>
        </span>
        <span
          data-tooltip-id="attribute-tooltip"
          data-tooltip-content={
            attribute.aliases.length > 0
              ? 'Attribute-name and alias' + (attribute.aliases.length > 1 ? 'es' : '')
              : 'Attribute-name'
          }
        >
          <span className={cName}>{attribute.name}</span>
          {attribute.aliases.map((alias, index) => (
            <span key={index} className={cName}><span className={cPunct}>,</span> {alias}</span>
          ))}
        </span>
        <span className={cPunct}>
          :&nbsp;
          <TypeRender type={attribute.type}/>
          {
            attribute.fallback !== null
              && <span
                  style={{marginLeft: '.5rem'}}
                  className={cPunct}
                  data-tooltip-id="attribute-tooltip"
                  data-tooltip-content="Default value"
                >
                (<span style={{color: attribute.type.color}}>{attribute.fallback}</span>)
              </span>
          }
        </span>
      </p>
      {
        (Array.isArray(attribute.description) ? attribute.description : [attribute.description]).map((line, index) => (
          <p key={index} style={{margin: 0, paddingLeft: '.5rem', fontSize: '.9rem', color: 'gray', fontStyle: 'italic'}}>
            &nbsp;&nbsp;↪ {line}
          </p>
        ))
      }
    </div>
  );
};

export const TagDocRender: React.FC<{ tag: TagDoc }> = ({ tag }) => {
  const isBrowser = useIsBrowser();

  if (isBrowser)
    injectTokenStyle();

  const cMPunct= decideClassName('MARKUP__PUNCTUATION__TAG');
  const cName = decideClassName('MARKUP__IDENTIFIER__TAG');
  const cEPunct = decideClassName('EXPRESSION__PUNCTUATION__ANY');

  return (
    <div style={{
      backgroundColor: '#1e1e1e',
      border: "var(--ifm-table-border-width) solid var(--ifm-table-border-color)",
      borderRadius: '.4rem',
      fontFamily: 'Menlo, Monaco, Consolas, "Andale Mono", "Ubuntu Mono", "Courier New", monospace',
      padding: '.7rem 1rem',
      overflowX: 'scroll',
      maxWidth: 'max-content',
      margin: '1rem 0',
    }}>
      <p style={{margin: 0}}>
        <span className={cMPunct}>{'<'}</span>
        <span className={cName}>{tag.name}</span>
        {tag.aliases.map((alias, index) => (
          <span key={index} className={cName}><span className={cEPunct}>,</span> {alias}</span>
        ))}
      </p>
      { tag.attributes.map((attribute, index) => <div key={index} style={{marginTop: index == 0 ? 0 : '.5rem'}}>
        <AttributeLineRender tag={tag} attribute={attribute} />
        </div>)
      }
      <p style={{margin: 0}}>
        {
          tag.selfClosing
            ? <span className={cMPunct}>{'/>'}</span>
            : <span>
              <span className={cMPunct}>{'>'}</span>
              <span style={{padding: '0 .5rem'}}><TypeRender type={AttributeType.MARKUP}/></span>
              <span className={cMPunct}>{'</>'}</span>
            </span>
        }
      </p>
    </div>
  );
};