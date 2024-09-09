public class Response<T>
{
    public T Value { get; set; }
    public bool Status { get; set; }
    public string Message { get; set; }
    public Response(T value, bool status, string message)
    {
        Value = value;
        Status = status;
        Message = message;
    }
}