

export default function Home() {
    return (
        <div className="w-full">
            <div className="flex justify-center">
                <p className="text-3xl font-bold">Tools</p>
            </div>
            <div className="flex flex-col items-center pt-10">
                <div>
                    <a>
                        /jsonToString
                    </a>
                    <p>Json to string converter.</p>
                </div>
                <div>
                    <a>
                        /stringToJson
                    </a>
                    <p>String to json converter.</p>
                </div>
                <div>
                    <a>
                        /jsonToTypeScript
                    </a>
                    <p>Json to TypeScript.</p>
                </div>
            </div>
        </div>
    );
}