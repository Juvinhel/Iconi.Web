namespace Data
{
    export function calculateUpdateInterval(itemCount: number): number
    {
        let zeroes = itemCount.toFixed(0).length - 3;
        if (zeroes < 0) zeroes = 0;
        return parseInt("1" + "0".repeat(zeroes));
    }
}