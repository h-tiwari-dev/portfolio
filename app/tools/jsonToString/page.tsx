"use client";
import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const [_json, _setJson] = useState<string>();
  const [_jsonError, _setJsonError] = useState<boolean>();
  const [_jsonStringified, _setJsonStringified] = useState<string>();
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    try {
      if (_json !== undefined) {
        console.log(_json, typeof (_json));
        _setJsonStringified(JSON.stringify(JSON.stringify(JSON.parse(_json))))
        _setJsonError(false);
      }
    } catch (error) {
      console.log(error)
      _setJsonError(true);
      _setJsonStringified('')
    }
  }, [_json])

  useEffect(() => {
    if (ref && ref.current && _jsonStringified !== undefined) {
      ref.current.textContent = _jsonStringified;
    }
  }, [_jsonStringified])

  return (
    <div className="w-full">
      <div className="flex justify-center">
        <p className="text-3xl font-bold">JSON To String</p>
      </div>
      <div className="flex flex-col items-center pt-10">
        {/* <CardWrapper heading="Heading"> */}
        <textarea
          className="w-2/4 h-56 p-2 m-2 border focus:outline-none focus:border-blue-500 bg-white overflow-y-scroll"
          placeholder="Enter JSON here..."
          value={_json}
          onChange={(e) => _setJson(e.target.value)}
        ></textarea>
        {
          _jsonError && <p
            className='text-red-500'
          >Invalid JSON</p>
        }
        <p
          className="w-2/4 h-fit p-2 m-2 border focus:outline-none focus:border-blue-500 bg-white overflow-y-scroll"
          ref={ref}>Stringified Json...</p>
      </div>
    </div>
  );
}
