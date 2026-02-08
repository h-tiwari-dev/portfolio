"use client";
import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const [_jsonString, _setJsonString] = useState<string>();
  const [_jsonError, _setJsonError] = useState<boolean>();
  const [_json, _setJson] = useState<any>();
  const ref = useRef<HTMLPreElement>(null);

  useEffect(() => {
    try {
      if (_jsonString !== undefined) {
        _setJson(JSON.stringify(JSON.parse(JSON.parse(_jsonString)), undefined, 2))
        _setJsonError(false);
      }
    } catch (error) {
      console.log(error)
      _setJsonError(true);
      _setJson('')
    }
  }, [_jsonString])

  useEffect(() => {
    if (ref && ref.current && _json !== undefined) {
      ref.current.textContent = _json
    }
  }, [_json])

  return (
    <div className="w-full">
      <div className="flex justify-center">
        <p className="text-3xl font-bold">String To Json</p>
      </div>
      <div className="flex flex-col items-center pt-10">
        {/* <CardWrapper heading="Heading"> */}
        <textarea
          className="w-2/4 h-20 p-2 m-2 border rounded focus:outline-none focus:border-blue-500 bg-white overflow-y-scroll"
          placeholder="Enter JSON here..."
          value={_jsonString}
          onChange={(e) => _setJsonString(e.target.value)}
        ></textarea>
        {
          _jsonError && <p
            className='text-red-500'
          >Invalid JSON String</p>
        }
        <pre
          className="w-2/4 h-fit p-2 m-2 border rounded focus:outline-none focus:border-blue-500 bg-white overflow-y-scroll"
          ref={ref}>Json Object...</pre>
      </div>
    </div>
  );
}
